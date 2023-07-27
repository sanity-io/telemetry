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
    traceDef: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    const traceId = typeid('trace')
    return {
      start() {
        pushTraceEntry('trace.start', traceId, traceDef)
      },
      log(data?: unknown) {
        const result = traceDef.schema.safeParse(data)
        if (result.success) {
          pushTraceEntry('trace.log', traceId, traceDef, result.data)
        } else {
          // ignore
        }
      },
      complete() {
        pushTraceEntry('trace.complete', traceId, traceDef)
      },
      error(error: Error) {
        pushTraceEntry('trace.error', traceId, traceDef, error)
      },
      await<P extends Promise<unknown>>(promise: P, data?: z.infer<Schema>): P {
        const dataPassed = arguments.length > 1
        this.start()
        promise.then(
          (result) => {
            this.log(dataPassed ? data : result)
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

  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {
    const result = event.schema.safeParse(data)
    if (result.success) {
      pushLogEntry('log', event, data)
    }
  }

  return {
    events$: logEntries$.asObservable(),
    logger: {
      trace,
      log,
    },
  }
}
