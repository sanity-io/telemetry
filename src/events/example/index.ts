import {z} from 'zod'
import {_defineLogEvent, _defineTraceEvent} from '../../internal'

export const incrementButtonClickEvent = _defineLogEvent({
  name: 'incrementButtonClickEvent',
  version: 1,
  displayName: 'Increment button clicked',
  description: 'User incremented a number',
  schema: z.object({count: z.number()}),
})

export const exampleTrace = _defineTraceEvent({
  name: 'exampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for demo purposes',
  schema: z.object({step: z.string()}),
})

export const exampleEvent = _defineLogEvent({
  name: 'exampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
  schema: z.object({foo: z.literal('bar')}),
})

export const saveCommentTrace = _defineTraceEvent({
  name: 'postCommentTrace',
  version: 1,
  displayName: 'Save comment',
  description: 'User saved a comment',
  schema: z.object({ok: z.boolean()}).optional(),
})
