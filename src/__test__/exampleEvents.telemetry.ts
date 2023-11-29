import {defineLogEvent, defineTraceEvent} from '../'

export const ExampleTrace = defineTraceEvent({
  name: 'ExampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for test purposes',
})

export const ExampleEvent = defineLogEvent<{foo: 'bar'}>({
  name: 'ExampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
})
