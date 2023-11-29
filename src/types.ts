import {z, ZodType, ZodUndefined} from 'zod'

export type KnownTelemetryEventName = string & {__type: 'TelemetryName'}

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
  steps?: Record<string, TelemetryTraceOptions<ZodType>>
}

export interface KnownTelemetryLogEvent<Schema extends ZodType = ZodType> {
  name: KnownTelemetryEventName
  type: 'log'
  version: number
  displayName: string
  description: string
  schema: Schema
}

export interface KnownTelemetryTrace<Schema extends ZodType = ZodType> {
  name: KnownTelemetryEventName
  type: 'trace'
  version: number
  displayName: string
  description: string
  schema: Schema
  steps?: Record<string, TelemetryTraceOptions<ZodType>>
}

export interface TelemetryTrace<Schema extends ZodType = ZodType> {
  start(): void
  log(data: z.infer<Schema>): void
  error(error: Error): void
  complete(): void
  newContext(name: string): TelemetryLogger
  await<P extends Promise<unknown>>(promise: P, finalData: z.infer<Schema>): P
  await<P extends Promise<unknown>>(promise: P): P
}

/**
 * Note that `sessionId` is removed from the signature of these functions
 */
export interface TelemetryLogger {
  /*
   * Log a single event, typically a user action, e.g. "Publish"-button clicked
   */
  log<Schema extends ZodType = ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data: z.infer<Schema>,
  ): void

  log<Schema extends ZodUndefined>(event: KnownTelemetryLogEvent<Schema>): void

  /*
   * Trace an operation that may take some time and consist of multiple steps, and that could potentially fail, e.g. request to mutate a document
   * Suitable for use with async/await or Observables
   */
  trace<Schema extends ZodType = ZodType>(
    event: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema>
}

export type TelemetryLogEvent = {
  type: 'log'
  name: string // pre-defined event name
  version: number // version of event
  sessionId: string
  createdAt: string
  data: unknown
}

export type TelemetryTraceStartEvent = {
  type: 'trace.start'
  name: string // pre-defined event name
  version: number // version of event
  traceId: string
  sessionId: string
  createdAt: string
}

export type TelemetryTraceLogEvent<T = unknown> = {
  type: 'trace.log'
  name: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceErrorEvent<T = unknown> = {
  type: 'trace.error'
  name: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceCompleteEvent<T = unknown> = {
  type: 'trace.complete'
  name: string // pre-defined event name
  version: number // version of pre-defined event
  traceId: string
  sessionId: string
  createdAt: string
  data: T
}
export type TelemetryTraceEvent =
  | TelemetryTraceStartEvent
  | TelemetryTraceLogEvent
  | TelemetryTraceErrorEvent
  | TelemetryTraceCompleteEvent

export type TelemetryEvent = TelemetryLogEvent | TelemetryTraceEvent

export interface TelemetryStore {
  logger: TelemetryLogger
  end: () => void
  endWithBeacon: () => boolean
  flush: () => Promise<void>
}
