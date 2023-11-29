import {defineLogEvent, defineTraceEvent} from '@sanity/telemetry'

export const PublishDocument = defineLogEvent({
  name: 'PublishDocument',
  version: 1,
  displayName: 'Publish document',
  description: 'User clicked the "Publish" button in the document pane',
})

export const ReviewChangesOpened = defineLogEvent({
  name: 'ReviewChangesOpened',
  version: 1,
  displayName: 'Review changes opened',
  description: 'User opened review changes',
})

export const StudioMount = defineLogEvent<{
  studioVersion: string
  pluginVersions: {pluginName: string; version: string}[]
}>({
  name: 'StudioMount',
  version: 1,
  displayName: 'Studio mount',
  description: 'The Studio was mounted on the page',
})

export const ExampleIncrementButtonClick = defineLogEvent<{count: number}>({
  name: 'ExampleIncrementButtonClick',
  version: 1,
  displayName: 'Increment button clicked',
  description: 'User incremented a number',
})

export const ExampleTrace = defineTraceEvent({
  name: 'ExampleTrace',
  version: 1,
  displayName: 'Example Trace',
  description: 'An example trace for demo purposes',
})

export const ExampleEvent = defineLogEvent<{foo: 'bar'}>({
  name: 'ExampleEvent',
  version: 1,
  displayName: 'An example event',
  description: 'An example event happened',
})

export const ExampleSaveComment = defineTraceEvent<{ok?: boolean}>({
  name: 'ExampleSaveComment',
  version: 1,
  displayName: 'Save comment',
  description: 'User saved a comment',
})
