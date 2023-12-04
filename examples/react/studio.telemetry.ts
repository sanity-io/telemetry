import {defineEvent, defineTrace} from '@sanity/telemetry'

export const PublishDocument = defineEvent({
  name: 'PublishDocument',
  version: 1,
  description: 'User clicked the "Publish" button in the document pane',
})

export const ReviewChangesOpened = defineEvent({
  name: 'ReviewChangesOpened',
  version: 1,
  description: 'User opened review changes',
})

export const StudioMount = defineEvent<{
  studioVersion: string
  pluginVersions: {pluginName: string; version: string}[]
}>({
  name: 'StudioMount',
  version: 1,
  description: 'The Studio was mounted on the page',
})

export const ExampleIncrementButtonClick = defineEvent<{count: number}>({
  name: 'ExampleIncrementButtonClick',
  version: 1,
  description: 'User incremented a number',
})

export const ExampleTrace = defineTrace({
  name: 'ExampleTrace',
  version: 1,
  description: 'An example trace for demo purposes',
})

export const ExampleEvent = defineEvent<{foo: 'bar'}>({
  name: 'ExampleEvent',
  version: 1,
  description: 'An example event happened',
})

export const ExampleSaveComment = defineTrace<{ok?: boolean}>({
  name: 'ExampleSaveComment',
  version: 1,
  description: 'User saved a comment',
})
