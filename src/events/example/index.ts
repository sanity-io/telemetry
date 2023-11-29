import {z} from 'zod'
import {defineLogEvent, defineTraceEvent} from '../../defineEvents'

export const ExampleIncrementButtonClick = defineLogEvent({
  name: 'ExampleIncrementButtonClick',
  version: 1,
  displayName: 'Increment button clicked',
  description: 'User incremented a number',
  schema: z.object({count: z.number()}),
})

export const ExampleTrace = defineTraceEvent({
  name: 'ExampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for demo purposes',
  schema: z.object({step: z.string()}),
})

export const ExampleEvent = defineLogEvent({
  name: 'ExampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
  schema: z.object({foo: z.literal('bar')}),
})

export const ExampleSaveComment = defineTraceEvent({
  name: 'ExampleSaveComment',
  version: 1,
  displayName: 'Save comment',
  description: 'User saved a comment',
  schema: z.object({ok: z.boolean()}).optional(),
})

export const ExampleCliStart = defineLogEvent({
  name: 'ExampleCliStart',
  version: 1,
  displayName: 'Example CLI start',
  description: 'Example CLI started',
  schema: z.object({nodeVersion: z.string()}),
})
export const ExampleCliAction = defineTraceEvent({
  name: 'ExampleCliActionBegin',
  version: 1,
  displayName: 'Example CLI action trace',
  description: 'Example CLI action trace',
  schema: z.object({actionName: z.string()}),
})

export const ExampleCliInitCommand = defineTraceEvent({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
  schema: z.object({step: z.string()}),
})
export const ExampleCliHelpCommand = defineLogEvent({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
})
