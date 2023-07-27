import {z} from 'zod'
import {_defineLogEvent, _defineTraceEvent} from '../../internal'

export const PublishDocument = _defineLogEvent({
  name: 'PublishDocument',
  version: 1,
  displayName: 'Publish document',
  description: 'User clicked the "Publish" button in the document pane',
})

export const ReviewChangesOpened = _defineLogEvent({
  name: 'ReviewChangesOpened',
  version: 1,
  displayName: 'Review changes opened',
  description: 'User opened review changes',
})

export const StudioMount = _defineLogEvent({
  name: 'StudioMount',
  version: 1,
  displayName: 'Studio mount',
  description: 'The Studio was mounted on the page',
  schema: z.object({
    studioVersion: z.string(),
    pluginVersions: z.array(
      z.object({pluginName: z.string(), version: z.string()}),
    ),
  }),
})
