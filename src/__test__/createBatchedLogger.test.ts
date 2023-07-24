import {test, vi, expect} from 'vitest'
import {createBatchedLogger} from '../createBatchedLogger'
import {exampleEvent} from '../events'

test('Logging an example event', async () => {
  const submitEntries = vi.fn().mockResolvedValue(undefined)
  const logger = createBatchedLogger('test', {
    flushInterval: 100,
    resolveConsent: () => Promise.resolve(true),
    submitEntries,
  })

  logger.log(exampleEvent, {foo: 'bar'})

  await new Promise((resolve) => setTimeout(resolve, 200))
  expect(submitEntries.mock.calls[0][0]).toMatchObject([
    {
      createdAt: /.+/,
      data: {foo: 'bar'},
      event: 'exampleEvent',
      sessionId: 'test',
      type: 'log',
      version: 1,
    },
  ])
})
