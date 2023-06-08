import { _defineLogEvent } from "../../internal.ts"
import { z } from "zod"

export const cliStartEvent = _defineLogEvent({
  name: "cliStartEvent",
  version: 1,
  displayName: "sanity cli started",
  description: "User ran the sanity cli",
  schema: z.object({ nodeVersion: z.string() }),
})

export const cliInitActionEvent = _defineLogEvent({
  name: "cliInitEvent",
  version: 1,
  displayName: "sanity init",
  description: "User ran sanity init",
})
