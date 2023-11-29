import {defineLogEvent, defineTraceEvent} from '../../defineEvents'
import {discriminatedUnion, union, z} from 'zod'

export const CliStart = defineLogEvent({
  name: 'cliStartEvent',
  version: 1,
  displayName: 'sanity cli started',
  description: 'User ran the sanity cli',
  schema: z.object({nodeVersion: z.string(), cliVersion: z.string()}),
})

const nullCommand = z.object({commandName: z.null()})
const startCommand = z.object({commandName: z.literal('start')})

export const CliCommand = defineTraceEvent({
  name: 'cliCommand',
  version: 1,
  displayName: 'CLI action',
  description: 'User ran a cli action',
  schema: z.object({commandName: z.string()}),
})
