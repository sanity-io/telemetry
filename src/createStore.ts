import {
  DefinedTelemetryLog,
  DefinedTelemetryTrace,
  TelemetryEvent,
  TelemetryLogEvent,
  TelemetryLogger,
  TelemetryTrace,
  TelemetryTraceEvent,
} from './types'
import {Observable, Subject} from 'rxjs'
import {SessionId} from './createSessionId'
import {createTraceId} from './createTraceId'

/**
 * Bare-bones store for logging and reacting to telemetry events
 * @internal
 * @param sessionId
 */
export function createStore(sessionId: SessionId): {
  events$: Observable<TelemetryEvent>
  logger: TelemetryLogger
} {
  const logEntries$ = new Subject<TelemetryEvent>()

  function pushTraceEntry<Data, Err extends {message: string}>(
    type: 'trace.error',
    traceId: string,
    telemetryTrace: DefinedTelemetryTrace<Data>,
    error: {message: string},
  ): void
  function pushTraceEntry<Data>(
    type: 'trace.start',
    traceId: string,
    telemetryTrace: DefinedTelemetryTrace<Data>,
  ): void
  function pushTraceEntry<Data>(
    type: 'trace.log',
    traceId: string,
    telemetryTrace: DefinedTelemetryTrace<Data>,
    data: Data,
  ): void
  function pushTraceEntry<Data>(
    type: 'trace.complete',
    traceId: string,
    telemetryTrace: DefinedTelemetryTrace<Data>,
  ): void
  function pushTraceEntry<Data>(
    type: TelemetryTraceEvent['type'],
    traceId: string,
    telemetryTrace: DefinedTelemetryTrace<Data>,
    data?: Data,
  ) {
    logEntries$.next({
      sessionId,
      type,
      traceId,
      name: telemetryTrace.name,
      version: telemetryTrace.version,
      data,
      createdAt: new Date().toISOString(),
    })
  }

  function pushLogEntry<Data>(
    type: TelemetryLogEvent['type'],
    event: DefinedTelemetryLog<Data>,
    data?: unknown,
  ) {
    logEntries$.next({
      sessionId,
      type,
      version: event.version,
      name: event.name,
      data,
      createdAt: new Date().toISOString(),
    })
  }

  function createTrace<Data = void>(
    traceId: string,
    traceDef: DefinedTelemetryTrace<Data>,
  ): TelemetryTrace<Data> {
    return {
      start() {
        pushTraceEntry('trace.start', traceId, traceDef)
      },
      newContext(name: string): TelemetryLogger {
        return {
          trace<InnerData>(innerTraceDef: DefinedTelemetryTrace<InnerData>) {
            return createTrace<InnerData>(`${traceId}.${name}`, innerTraceDef)
          },
          log,
        }
      },
      log(data?: unknown) {
        pushTraceEntry('trace.log', traceId, traceDef, data)
      },
      complete() {
        pushTraceEntry('trace.complete', traceId, traceDef)
      },
      error(error: Error) {
        pushTraceEntry('trace.error', traceId, traceDef, error)
      },
      await<P extends Promise<Data>>(promise: P, data?: Data): P {
        this.start()
        promise.then(
          (result) => {
            this.log(data ? data : result)
            this.complete()
            return result
          },
          (error) => {
            this.error(error)
            throw error
          },
        )
        return promise
      },
    }
  }

  function log<Data>(event: DefinedTelemetryLog<Data>, data?: Data) {
    pushLogEntry('log', event, data)
  }

  return {
    events$: logEntries$.asObservable(),
    logger: {
      trace: <Data>(traceDef: DefinedTelemetryTrace<Data>) => {
        const traceId = createTraceId()
        return createTrace(traceId, traceDef)
      },
      log,
    },
  }
}
