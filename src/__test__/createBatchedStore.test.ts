import {expect, test, vi} from 'vitest'
import {createBatchedStore} from '../createBatchedStore'
import {exampleEvent} from '../events'
import {createSessionId} from '../'

test('Logging an example event', async () => {
  const sendEvents = vi.fn().mockResolvedValue(undefined)
  const {logger} = createBatchedStore(createSessionId(), {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve(true),
    sendEvents,
  })

  logger.log(exampleEvent, {foo: 'bar'})

  await new Promise((resolve) => setTimeout(resolve, 200))

  expect(sendEvents.mock.calls?.[0]?.[0]).toMatchObject([
    {
      name: 'exampleEvent',
      sessionId: /.+/,
      createdAt: /.+/,
      data: {foo: 'bar'},
      type: 'log',
      version: 1,
    },
  ])
})
