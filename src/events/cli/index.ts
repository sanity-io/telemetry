import {_defineLogEvent} from '../../internal'
import {z} from 'zod'

export const CliStart = _defineLogEvent({
  name: 'cliStartEvent',
  version: 1,
  displayName: 'sanity cli started',
  description: 'User ran the sanity cli',
  schema: z.object({nodeVersion: z.string(), cliVersion: z.string()}),
})

export const CliActionStart = _defineLogEvent({
  name: 'CliActionStart',
  version: 1,
  displayName: 'Cli action started',
  description: 'User ran a cli action',
  schema: z.object({name: z.string()}),
})
