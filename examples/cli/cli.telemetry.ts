import {defineEvent, defineTrace} from '@sanity/telemetry'

export const ExampleCliStart = defineEvent<{nodeVersion: string}>({
  name: 'ExampleCliStart',
  version: 1,
  displayName: 'Example CLI start',
  description: 'Example CLI started',
})
export const ExampleCliAction = defineTrace<{actionName: string}>({
  name: 'ExampleCliActionBegin',
  version: 1,
  displayName: 'Example CLI action trace',
  description: 'Example CLI action trace',
})

export const ExampleCliInitCommand = defineTrace<{step: string}>({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
})
export const ExampleCliHelpCommand = defineEvent({
  name: 'ExampleCliInit',
  version: 1,
  displayName: 'Example CLI init trace',
  description: 'Example CLI init action trace',
})
