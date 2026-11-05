import {afterEach, expect, test, vi} from 'vitest'
import {createBatchedStore} from '../createBatchedStore'
import {createSessionId} from '../'
import {
  ExampleEvent,
  ExampleSampledEvent,
  ExampleTrace,
} from './exampleEvents.telemetry'

test.each([false, true])(
  'Events logged after endWithBeacon are batched in a microtask (initial buffer: %s)',
  async (hasBufferedEvent) => {
    const sendEvents = vi.fn().mockResolvedValue(undefined)
    const sendBeacon = vi.fn().mockReturnValue(true)
    const resolveConsent = vi.fn().mockResolvedValue({status: 'denied'})
    const store = createBatchedStore(createSessionId(), {
      resolveConsent,
      sendEvents,
      sendBeacon,
    })

    if (hasBufferedEvent) {
      store.logger.log(ExampleEvent, {foo: 'before pagehide'})
    }
    expect(store.endWithBeacon()).toBe(true)
    const initialCalls = hasBufferedEvent ? 1 : 0
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls)
    expect(store.endWithBeacon()).toBe(true)
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls)
    if (hasBufferedEvent) {
      expect(sendBeacon.mock.calls[0][0]).toMatchObject([
        {name: ExampleEvent.name, data: {foo: 'before pagehide'}},
      ])
    }

    store.logger.log(ExampleEvent, {foo: 'unsaved work'})
    store.logger.log(ExampleEvent, {foo: 'leaving'})
    expect(store.endWithBeacon()).toBe(true)
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls)

    await Promise.resolve()

    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls + 1)
    expect(sendBeacon.mock.calls[initialCalls][0]).toMatchObject([
      {name: ExampleEvent.name, data: {foo: 'unsaved work'}},
      {name: ExampleEvent.name, data: {foo: 'leaving'}},
    ])

    store.logger.log(ExampleEvent, {foo: 'later'})
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls + 1)
    await Promise.resolve()
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls + 2)
    expect(sendBeacon.mock.calls[initialCalls + 1][0]).toMatchObject([
      {name: ExampleEvent.name, data: {foo: 'later'}},
    ])
    expect(sendEvents).not.toHaveBeenCalled()
    expect(resolveConsent).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 0))
    store.logger.log(ExampleEvent, {foo: 'restored without consent'})
    await store.flush()
    expect(resolveConsent).toHaveBeenCalledTimes(1)
    expect(sendEvents).not.toHaveBeenCalled()
    expect(sendBeacon).toHaveBeenCalledTimes(initialCalls + 2)
    await store.end()
  },
)

afterEach(() => {
  vi.useRealTimers()
})

test.each(['granted', 'denied'] as const)(
  'After a task boundary normal batching resumes with consent %s',
  async (status) => {
    const sendEvents = vi.fn().mockResolvedValue(undefined)
    const sendBeacon = vi.fn().mockReturnValue(true)
    const resolveConsent = vi.fn().mockResolvedValue({status})
    const store = createBatchedStore(createSessionId(), {
      sendEvents,
      sendBeacon,
      resolveConsent,
    })
    store.endWithBeacon()
    await new Promise((resolve) => setTimeout(resolve, 0))
    store.logger.log(ExampleEvent, {foo: 'restored'})
    await store.flush()
    expect(resolveConsent).toHaveBeenCalledTimes(1)
    expect(sendBeacon).not.toHaveBeenCalled()
    expect(sendEvents).toHaveBeenCalledTimes(status === 'granted' ? 1 : 0)
    if (status === 'granted') {
      expect(sendEvents.mock.calls[0][0]).toMatchObject([
        {data: {foo: 'restored'}},
      ])
    }
    await store.end()
  },
)

test('Beacon re-entry waits for the next batch without spinning microtasks', () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'queueMicrotask']})
  const sendBeacon = vi.fn((_events: unknown[]) => {
    // Bound the faulty implementation so the regression fails without hanging.
    if (sendBeacon.mock.calls.length < 3) {
      store.logger.log(ExampleEvent, {foo: 're-entry'})
    }
    return true
  })
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    sendBeacon,
  })
  store.endWithBeacon()
  store.logger.log(ExampleEvent, {foo: 'late'})
  vi.runAllTicks()
  expect(sendBeacon).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(0)
  expect(sendBeacon).toHaveBeenCalledTimes(2)
  expect(sendBeacon.mock.calls[1][0]).toMatchObject([{data: {foo: 're-entry'}}])
})

test('end after endWithBeacon cancels queued and future late beacons', async () => {
  const sendBeacon = vi.fn().mockReturnValue(true)
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    sendBeacon,
  })
  store.endWithBeacon()
  store.logger.log(ExampleEvent, {foo: 'queued'})
  await store.end()
  store.logger.log(ExampleEvent, {foo: 'after end'})
  await new Promise((resolve) => setTimeout(resolve, 0))
  store.logger.log(ExampleEvent, {foo: 'after window'})
  await store.flush()
  expect(sendBeacon).not.toHaveBeenCalled()
})

test('endWithBeacon after end does not revive sending', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const sendBeacon = vi.fn().mockReturnValue(true)
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
    sendBeacon,
  })
  await store.end()
  expect(store.endWithBeacon()).toBe(true)
  store.logger.log(ExampleEvent, {foo: 'after end'})
  await new Promise((resolve) => setTimeout(resolve, 0))
  store.logger.log(ExampleEvent, {foo: 'after window'})
  await store.flush()
  expect(sendBeacon).not.toHaveBeenCalled()
  expect(sendEvents).not.toHaveBeenCalled()
})

test('A throwing late beacon drops its batch without an uncaught microtask error', () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'queueMicrotask']})
  const sendBeacon = vi
    .fn()
    .mockImplementationOnce(() => {
      throw new Error('beacon failed')
    })
    .mockReturnValue(true)
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    sendBeacon,
  })
  store.endWithBeacon()
  store.logger.log(ExampleEvent, {foo: 'dropped'})
  expect(() => vi.runAllTicks()).not.toThrow()
  store.logger.log(ExampleEvent, {foo: 'next'})
  vi.runAllTicks()
  expect(sendBeacon).toHaveBeenCalledTimes(2)
  expect(sendBeacon.mock.calls[1][0]).toMatchObject([{data: {foo: 'next'}}])
})

test('An event logged by the initial beacon is sent before the next task', () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'queueMicrotask']})
  const sendBeacon = vi.fn((_events: unknown[]) => {
    if (sendBeacon.mock.calls.length === 1) {
      store.logger.log(ExampleEvent, {foo: 'during initial beacon'})
    }
    return true
  })
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents: vi.fn().mockResolvedValue(undefined),
    sendBeacon,
  })
  store.logger.log(ExampleEvent, {foo: 'buffered'})
  store.endWithBeacon()
  expect(sendBeacon).toHaveBeenCalledTimes(1)
  vi.runAllTicks()
  expect(sendBeacon).toHaveBeenCalledTimes(2)
  expect(sendBeacon.mock.calls[1][0]).toMatchObject([
    {data: {foo: 'during initial beacon'}},
  ])
})

test('A second pagehide after restore sends buffered and late events by beacon', () => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'queueMicrotask']})
  const sendBeacon = vi.fn().mockReturnValue(true)
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const store = createBatchedStore(createSessionId(), {
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
    sendBeacon,
  })
  store.endWithBeacon()
  vi.advanceTimersByTime(0)
  store.logger.log(ExampleEvent, {foo: 'after restore'})
  store.endWithBeacon()
  expect(sendBeacon).toHaveBeenCalledTimes(1)
  expect(sendBeacon.mock.calls[0][0]).toMatchObject([
    {data: {foo: 'after restore'}},
  ])
  store.logger.log(ExampleEvent, {foo: 'second hide late one'})
  store.logger.log(ExampleEvent, {foo: 'second hide late two'})
  expect(sendBeacon).toHaveBeenCalledTimes(1)
  vi.runAllTicks()
  expect(sendBeacon).toHaveBeenCalledTimes(2)
  expect(sendBeacon.mock.calls[1][0]).toMatchObject([
    {data: {foo: 'second hide late one'}},
    {data: {foo: 'second hide late two'}},
  ])
  expect(sendEvents).not.toHaveBeenCalled()
})

test('end flushes pending late events through consent-checked sendEvents', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const sendBeacon = vi.fn().mockReturnValue(true)
  const resolveConsent = vi.fn().mockResolvedValue({status: 'granted'})
  const store = createBatchedStore(createSessionId(), {
    resolveConsent,
    sendEvents,
    sendBeacon,
  })
  store.endWithBeacon()
  store.logger.log(ExampleEvent, {foo: 'pending late event'})
  await store.end()
  expect(sendEvents).toHaveBeenCalledTimes(1)
  expect(sendEvents.mock.calls[0][0]).toMatchObject([
    {data: {foo: 'pending late event'}},
  ])
  expect(resolveConsent).toHaveBeenCalledTimes(1)
  expect(sendBeacon).not.toHaveBeenCalled()
})

test('Logging an example event', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  logger.log(ExampleEvent, {foo: 'bar'})

  await new Promise((resolve) => setTimeout(resolve, 200))

  expect(sendEvents.mock.calls?.[0]?.[0]).toMatchObject([
    {
      name: ExampleEvent.name,
      sessionId: /.+/,
      createdAt: /.+/,
      data: {foo: 'bar'},
      type: 'log',
      version: 1,
    },
  ])
})

test('Tracing an async operation that resolves to an invalid value', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  const trace = logger.trace(ExampleTrace)
  await trace.await(Promise.resolve({step: 'start'}))

  await new Promise((resolve) => setTimeout(resolve, 200))

  expect(sendEvents.mock.calls?.[0]?.[0]).toMatchObject([
    {
      sessionId: /.+/,
      createdAt: /.+/,
      name: 'ExampleTrace',
      traceId: /.+/,
      type: 'trace.start',
      data: undefined,
      context: undefined,
      version: 1,
    },
    {
      sessionId: /.+/,
      createdAt: /.+/,
      data: {step: 'start'},
      name: 'ExampleTrace',
      traceId: /.+/,
      context: undefined,
      type: 'trace.log',
      version: 1,
    },
    {
      sessionId: /.+/,
      createdAt: /.+/,
      name: 'ExampleTrace',
      traceId: /.+/,
      context: undefined,
      data: undefined,
      type: 'trace.complete',
      version: 1,
    },
  ])
})

test('It logs at most n event every "maxSampleRate"', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  logger.log(ExampleSampledEvent, {sampledAt: new Date().toISOString()})
  logger.log(ExampleSampledEvent, {sampledAt: new Date().toISOString()})
  logger.log(ExampleSampledEvent, {sampledAt: new Date().toISOString()})

  await new Promise((resolve) => setTimeout(resolve, 20))
  logger.log(ExampleSampledEvent, {sampledAt: new Date().toISOString()})
  logger.log(ExampleSampledEvent, {sampledAt: new Date().toISOString()})
  await new Promise((resolve) => setTimeout(resolve, 200))

  const sentEvents = sendEvents.mock.calls?.[0]?.[0]

  expect(sentEvents).toMatchObject([
    {
      sessionId: /.+/,
      createdAt: /.+/,
      data: {sampledAt: /.+/},
      name: 'ExampleSampledEvent',
      type: 'log',
      version: 1,
    },
    {
      sessionId: /.+/,
      createdAt: /.+/,
      data: {sampledAt: /.+/},
      name: 'ExampleSampledEvent',
      type: 'log',
      version: 1,
    },
  ])
})

test('Resuming deferred events', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  logger.resume([
    {
      createdAt: '2024-01-01T00:00:00.000Z',
      event: ExampleEvent,
      data: {foo: 'bar'},
    },
  ])

  await new Promise((resolve) => setTimeout(resolve, 200))

  expect(sendEvents.mock.calls?.[0]?.[0]).toMatchObject([
    {
      name: ExampleEvent.name,
      sessionId: /.+/,
      createdAt: '2024-01-01T00:00:00.000Z',
      data: {foo: 'bar'},
      type: 'log',
      version: 1,
    },
  ])
})

test('Resuming multiple deferred events preserves order and timestamps', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  logger.resume([
    {
      createdAt: '2024-01-01T00:00:00.000Z',
      event: ExampleEvent,
      data: {foo: 'bar'},
    },
    {
      createdAt: '2024-01-01T00:00:01.000Z',
      event: ExampleEvent,
      data: {foo: 'bar'},
    },
  ])

  await new Promise((resolve) => setTimeout(resolve, 200))

  const sentEvents = sendEvents.mock.calls?.[0]?.[0]
  expect(sentEvents).toHaveLength(2)
  expect(sentEvents[0].createdAt).toBe('2024-01-01T00:00:00.000Z')
  expect(sentEvents[1].createdAt).toBe('2024-01-01T00:00:01.000Z')
})

test('Resumed events are batched together with new events', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve({status: 'granted'}),
    sendEvents,
  })

  logger.resume([
    {
      createdAt: '2024-01-01T00:00:00.000Z',
      event: ExampleEvent,
      data: {foo: 'bar'},
    },
  ])
  logger.log(ExampleEvent, {foo: 'bar'})

  await new Promise((resolve) => setTimeout(resolve, 200))

  const sentEvents = sendEvents.mock.calls?.[0]?.[0]
  expect(sentEvents).toHaveLength(2)
  // Resumed event preserves original timestamp
  expect(sentEvents[0].createdAt).toBe('2024-01-01T00:00:00.000Z')
  // New event has a fresh timestamp
  expect(sentEvents[1].createdAt).not.toBe('2024-01-01T00:00:00.000Z')
})
