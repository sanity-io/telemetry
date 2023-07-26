import {z, ZodType} from 'zod'
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryEvent,
  TelemetryLogEvent,
  TelemetryLogger,
  TelemetryTrace,
  TelemetryTraceEvent,
} from './types'
import {Observable, Subject} from 'rxjs'
import {typeid} from 'typeid-ts'
import {SessionId} from './createSessionId'

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

  function pushTraceEntry<Schema extends ZodType>(
    type: TelemetryTraceEvent['type'],
    traceId: string,
    telemetryTrace: KnownTelemetryTrace,
    data?: unknown,
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

  function pushLogEntry<Schema extends ZodType>(
    type: TelemetryLogEvent['type'],
    event: KnownTelemetryLogEvent,
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
  function trace<Schema extends ZodType>(
    telemetryTrace: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    const traceId = typeid('trace')
    return {
      start() {
        pushTraceEntry('trace.start', traceId, telemetryTrace)
      },
      log(data?: unknown) {
        pushTraceEntry('trace.log', traceId, telemetryTrace, data)
      },
      complete() {
        pushTraceEntry('trace.complete', traceId, telemetryTrace)
      },
      error(error: Error) {
        pushTraceEntry('trace.error', traceId, telemetryTrace, error)
      },
      wrapPromise<P extends Promise<z.infer<Schema>>>(promise: P): P {
        this.start()
        return promise.then(
          (result) => {
            this.log(result)
            this.complete()
            return result
          },
          (error) => {
            this.error(error)
            throw error
          },
        ) as P
      },
    }
  }

  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {
    pushLogEntry('log', event, data)
  }

  return {
    events$: logEntries$.asObservable(),
    logger: {
      trace,
      log,
    },
  }
}
