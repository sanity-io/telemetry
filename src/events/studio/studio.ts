import { z } from "zod"
import { _defineLogEvent, _defineTraceEvent } from "../../internal.ts"

export const publishDocumentEvent = _defineLogEvent({
  name: "publishDocumentEvent",
  version: 1,
  displayName: "Publish document",
  description: 'User clicked the "Publish" button in the document pane',
})

export const reviewChangesOpenedEvent = _defineLogEvent({
  name: "reviewChangesOpened",
  version: 1,
  displayName: "Review changes opened",
  description: "User opened review changes",
})

export const uploadImageTrace = _defineTraceEvent({
  name: "uploadImageTrace",
  version: 1,
  displayName: "Uploading image",
  description: "User uploaded an image to the studio",
  schema: z.object({ imageSize: z.number() }),
})
