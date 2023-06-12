import { z, ZodType, ZodUndefined, ZodVoid } from "zod"

export type KnownTelemetryEventName = string & { __type: "TelemetryName" }

export interface TelemetryLogOptions<Schema extends ZodType | undefined> {
  name: string
  version: number
  displayName: string
  description: string
  schema?: Schema
}

export interface TelemetryTraceOptions<Schema extends ZodType> {
  name: string
  version: number
  displayName: string
  description: string
  schema?: Schema
}

export interface KnownTelemetryLogEvent<Schema extends ZodType = ZodType> {
  name: KnownTelemetryEventName
  type: "log"
  version: number
  displayName: string
  description: string
  schema: Schema
}

export interface KnownTelemetryTrace<Schema extends ZodType = ZodType> {
  name: KnownTelemetryEventName
  type: "trace"
  version: number
  displayName: string
  description: string
  schema: Schema
}

export interface TelemetryTrace<Schema extends ZodType = ZodType> {
  start(): void
  log(data: z.infer<Schema>): void
  error(error: Error): void
  complete(): void
}

export interface TelemetryLogger {
  /*
   * Log a single event, typically a user action, e.g. "Publish"-button clicked
   */
  log<Schema extends ZodType = ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data: z.infer<Schema>
  ): void
  log<Schema extends ZodUndefined>(event: KnownTelemetryLogEvent<Schema>): void

  /*
   * Trace an operation that may take some time and consist of multiple steps, and that could potentially fail, e.g. request to mutate a document
   * Suitable for use with async/await or Observables
   */
  trace<Schema extends ZodType = ZodType>(
    event: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema>
}

export type TelemetryLogEntry = {
  type: "log"
  event: string // pre-defined event name
  version: number // version of event
  sessionId: string
  createdAt: string
  data: unknown
}

export type TelemetryTraceStartEntry = {
  type: "trace.start"
  event: string // pre-defined event name
  version: number // version of event
  traceId: string
  sessionId: string
  createdAt: string
}

export type TelemetryTraceLogEntry<T = unknown> = {
  type: "trace.log"
  event: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceErrorEntry<T = unknown> = {
  type: "trace.error"
  event: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceCompleteEntry<T = unknown> = {
  type: "trace.complete"
  event: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceEntry =
  | TelemetryTraceStartEntry
  | TelemetryTraceLogEntry
  | TelemetryTraceErrorEntry
  | TelemetryTraceCompleteEntry

export type TelemetryEntry = TelemetryLogEntry | TelemetryTraceEntry
