import {z} from 'zod'
import {_defineLogEvent, _defineTraceEvent} from '../../internal.ts'

export const incrementButtonClickEvent = _defineLogEvent({
  name: 'incrementButtonClickEvent',
  version: 1,
  displayName: 'Increment button clicked',
  description: 'User incremented a number',
  schema: z.object({count: z.number()}),
})

export const saveCommentTrace = _defineTraceEvent({
  name: 'postCommentTrace',
  version: 1,
  displayName: 'Save comment',
  description: 'User saved a comment',
  schema: z.object({ok: z.boolean()}).optional(),
})
