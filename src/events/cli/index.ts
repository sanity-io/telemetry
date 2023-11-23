import {_defineLogEvent, _defineTraceEvent} from '../../internal'
import {discriminatedUnion, union, z} from 'zod'

export const CliStart = _defineLogEvent({
  name: 'cliStartEvent',
  version: 1,
  displayName: 'sanity cli started',
  description: 'User ran the sanity cli',
  schema: z.object({nodeVersion: z.string(), cliVersion: z.string()}),
})

const commonCommandProps = z.object({duration: z.number()})

const nullCommand = z.object({commandName: z.null()})
const startCommand = z.object({commandName: z.literal('start')})
const commands = discriminatedUnion('commandName', [nullCommand, startCommand])

export const CliCommand = _defineTraceEvent({
  name: 'cliCommand',
  version: 1,
  displayName: 'CLI action',
  description: 'User ran a cli action',
  schema: z.object({commandName: z.string()}),
})
