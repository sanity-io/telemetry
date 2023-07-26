import {z} from 'zod'
import {_defineLogEvent, _defineTraceEvent} from '../../internal'

export const publishDocumentEvent = _defineLogEvent({
  name: 'publishDocumentEvent',
  version: 1,
  displayName: 'Publish document',
  description: 'User clicked the "Publish" button in the document pane',
})

export const reviewChangesOpenedEvent = _defineLogEvent({
  name: 'reviewChangesOpened',
  version: 1,
  displayName: 'Review changes opened',
  description: 'User opened review changes',
})

export const uploadImageTrace = _defineTraceEvent({
  name: 'uploadImageTrace',
  version: 1,
  displayName: 'Uploading image',
  description: 'User uploaded an image to the studio',
  // define schema for the events that can be logged to the trace
  schema: z.object({imageSize: z.number()}),
})

export const studioSessionStart = _defineLogEvent({
  name: 'studioSessionStart',
  version: 1,
  displayName: 'Studio opened',
  description: 'Studio opened by user',
  schema: z.object({
    studioVersion: z.string(),
    pluginVersions: z.array(
      z.object({pluginName: z.string(), version: z.string()}),
    ),
  }),
})
