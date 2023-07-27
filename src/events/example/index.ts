import {z} from 'zod'
import {_defineLogEvent, _defineTraceEvent} from '../../internal'

export const ExampleIncrementButtonClick = _defineLogEvent({
  name: 'ExampleIncrementButtonClick',
  version: 1,
  displayName: 'Increment button clicked',
  description: 'User incremented a number',
  schema: z.object({count: z.number()}),
})

export const ExampleTrace = _defineTraceEvent({
  name: 'ExampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for demo purposes',
  schema: z.object({step: z.string()}),
})

export const ExampleEvent = _defineLogEvent({
  name: 'ExampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
  schema: z.object({foo: z.literal('bar')}),
})

export const ExampleSaveComment = _defineTraceEvent({
  name: 'ExampleSaveComment',
  version: 1,
  displayName: 'Save comment',
  description: 'User saved a comment',
  schema: z.object({ok: z.boolean()}).optional(),
})

export const ExampleCliStart = _defineLogEvent({
  name: 'ExampleCliStart',
  version: 1,
  displayName: 'Example CLI start',
  description: 'Example CLI started',
  schema: z.object({nodeVersion: z.string()}),
})
export const ExampleCliAction = _defineTraceEvent({
  name: 'ExampleCliActionBegin',
  version: 1,
  displayName: 'Example CLI action trace',
  description: 'Example CLI action trace',
  schema: z.object({actionName: z.string()}),
})
