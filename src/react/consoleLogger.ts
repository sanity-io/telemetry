/* eslint-disable no-console */
import type {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from '../types.ts'
import {z, ZodType} from 'zod'

export function createDefaultContext(): TelemetryLogger {
  function trace<Schema extends ZodType>(
    telemetryTrace: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {
        console.log(
          `[telemetry][${telemetryTrace.displayName}@${telemetryTrace.version}][${traceId}] start`,
          traceId,
        )
      },
      log(data?: unknown) {
        console.log(
          `[telemetry][${telemetryTrace.displayName}@${telemetryTrace.version}][${traceId}] log`,
          data,
        )
      },
      complete() {
        console.log(
          `[telemetry][${telemetryTrace.displayName}@${telemetryTrace.version}][${traceId}] complete`,
        )
      },
      error(error: Error) {
        console.log(
          `[telemetry][${telemetryTrace.displayName}@${telemetryTrace.version}][${traceId}] error`,
          error,
        )
      },
    }
  }
  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {
    console.log(`[telemetry][${event.displayName}@${event.version}] log`, data)
  }

  return {
    trace,
    log,
  }
}
