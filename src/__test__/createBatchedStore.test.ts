import {expect, test, vi} from 'vitest'
import {createBatchedStore} from '../createBatchedStore'
import {ExampleEvent, ExampleTrace} from '../events'
import {createSessionId} from '../'

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
      version: 1,
    },
    {
      sessionId: /.+/,
      createdAt: /.+/,
      data: {step: 'start'},
      name: 'ExampleTrace',
      traceId: /.+/,
      type: 'trace.log',
      version: 1,
    },
    {
      sessionId: /.+/,
      createdAt: /.+/,
      name: 'ExampleTrace',
      traceId: /.+/,
      type: 'trace.complete',
      version: 1,
    },
  ])
})
