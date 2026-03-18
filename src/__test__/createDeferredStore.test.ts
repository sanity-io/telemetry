import {expect, test, vi} from 'vitest'
import {createDeferredStore} from '../createDeferredStore'
import {ExampleEvent} from './exampleEvents.telemetry'

test('buffered events are returned by consumeEvents()', () => {
  const {logger, consumeEvents} = createDeferredStore()

  logger.log(ExampleEvent, {foo: 'bar'})

  const events = consumeEvents()
  expect(events).toHaveLength(1)
  expect(events[0]).toMatchObject({
    event: ExampleEvent,
    data: {foo: 'bar'},
  })
})

test('consumeEvents() drains the buffer', () => {
  const {logger, consumeEvents} = createDeferredStore()

  logger.log(ExampleEvent, {foo: 'bar'})

  expect(consumeEvents()).toHaveLength(1)
  expect(consumeEvents()).toHaveLength(0)
})

test('timestamps are captured at log time', () => {
  vi.useFakeTimers()
  try {
    const {logger, consumeEvents} = createDeferredStore()

    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    logger.log(ExampleEvent, {foo: 'bar'})

    vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'))
    logger.log(ExampleEvent, {foo: 'bar'})

    const events = consumeEvents()
    expect(events[0]?.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(events[1]?.createdAt).toBe('2024-01-01T00:00:01.000Z')
  } finally {
    vi.useRealTimers()
  }
})

test('event definitions are preserved', () => {
  const {logger, consumeEvents} = createDeferredStore()

  logger.log(ExampleEvent, {foo: 'bar'})

  const events = consumeEvents()
  expect(events[0]?.event).toBe(ExampleEvent)
  expect(events[0]?.event.name).toBe('ExampleEvent')
  expect(events[0]?.event.version).toBe(1)
})

test('resume() appends events to the buffer', () => {
  const {logger, consumeEvents} = createDeferredStore()

  logger.log(ExampleEvent, {foo: 'bar'})

  logger.resume([
    {
      createdAt: '2024-01-01T00:00:00.000Z',
      event: ExampleEvent,
      data: {foo: 'bar'},
    },
  ])

  const events = consumeEvents()
  expect(events).toHaveLength(2)
})
