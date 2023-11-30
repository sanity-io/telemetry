import {defineEvent, defineTrace} from '../'

export const ExampleTrace = defineTrace({
  name: 'ExampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for test purposes',
})

export const ExampleEvent = defineEvent<{foo: 'bar'}>({
  name: 'ExampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
})
