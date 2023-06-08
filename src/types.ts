import { z, ZodType, ZodUndefined, ZodVoid } from "zod"

export type KnownTelemetryEventName = string & { __type: "TelemetryId" }

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
    sessionId: string,
    event: KnownTelemetryLogEvent<Schema>,
    data: z.infer<Schema>
  ): void
  log<Schema extends ZodUndefined>(
    sessionId: string,
    event: KnownTelemetryLogEvent<Schema>
  ): void

  /*
   * Trace an operation that may take some time and consist of multiple steps, and that could potentially fail, e.g. request to mutate a document
   * Suitable for use with async/await or Observables
   */
  trace<Schema extends ZodType = ZodType>(
    sessionId: string,
    event: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema>
}
export interface TelemetryManager {
  logger: TelemetryLogger
}

export interface StudioTelemetryEvent<Schema extends ZodType> {
  name: KnownTelemetryLogEvent<Schema>
  data: z.infer<Schema>
}

export type StudioTelemetryTraceStartEvent = {
  type: "trace.start"
  id: string // pre-existing id
  createdAt: string
}

export type StudioTelemetryTraceLogEvent<T = unknown> = {
  id: string // pre-existing id
  type: "trace.log"
  createdAt: string
  data: T
}
export type StudioTelemetryTraceErrorEvent<T = unknown> = {
  id: string // pre-existing id
  type: "trace.error"
  createdAt: string
  data: T
}
export type StudioTelemetryTraceCompleteEvent<T = unknown> = {
  id: string // pre-existing id
  type: "trace.complete"
  createdAt: string
  data: T
}

export type StudioTelemetryTraceEvent =
  | StudioTelemetryTraceStartEvent
  | StudioTelemetryTraceLogEvent
  | StudioTelemetryTraceErrorEvent
  | StudioTelemetryTraceCompleteEvent

export type LoggedEvent = { event: KnownTelemetryEventName; data: unknown }
