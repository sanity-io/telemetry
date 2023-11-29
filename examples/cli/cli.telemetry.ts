import {defineLogEvent, defineTraceEvent} from '@sanity/telemetry'

export const ExampleCliStart = defineLogEvent<{nodeVersion: string}>({
  name: 'ExampleCliStart',
  version: 1,
  displayName: 'Example CLI start',
  description: 'Example CLI started',
})
export const ExampleCliAction = defineTraceEvent<{actionName: string}>({
  name: 'ExampleCliActionBegin',
  version: 1,
  displayName: 'Example CLI action trace',
  description: 'Example CLI action trace',
})

export const ExampleCliInitCommand = defineTraceEvent<{step: string}>({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
})
export const ExampleCliHelpCommand = defineLogEvent({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
})
