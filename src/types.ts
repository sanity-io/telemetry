export interface TelemetryLogOptions {
  name: string
  version: number
  displayName: string
  description: string
}

export interface TelemetryTraceOptions {
  name: string
  version: number
  displayName: string
  description: string
}

export interface DefinedTelemetryLog<Schema> {
  name: string
  type: 'log'
  version: number
  displayName: string
  description: string
  schema: Schema
}

export interface DefinedTelemetryTrace<Data = void> {
  name: string
  type: 'trace'
  version: number
  displayName: string
  description: string
  schema: Data
}

export interface TelemetryTrace<Data> {
  start(): void
  log(data: Data): void
  error(error: Error): void
  complete(): void
  newContext(name: string): TelemetryLogger
  await<P extends Promise<Data>>(promise: P): P
  await<P extends Promise<unknown>>(promise: P, finalData: Data): P
}

/**
 * Note that `sessionId` is removed from the signature of these functions
 */
export interface TelemetryLogger {
  /*
   * Log a single event, typically a user action, e.g. "Publish"-button clicked
   */
  log<Data>(event: DefinedTelemetryLog<Data>, data: Data): void
  log<Data extends void>(event: DefinedTelemetryLog<Data>): void

  /*
   * Trace an operation that may take some time and consist of multiple steps, and that could potentially fail, e.g. request to mutate a document
   * Suitable for use with async/await or Observables
   */
  trace<Data>(event: DefinedTelemetryTrace<Data>): TelemetryTrace<Data>
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
