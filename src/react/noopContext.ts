import type {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from '../types.ts'
import {z, ZodType} from 'zod'

export function createNoopContext(): TelemetryLogger {
  function trace<Schema extends ZodType>(
    telemetryTrace: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    return {
      start() {},
      log(data?: unknown) {},
      complete() {},
      error(error: Error) {},
    }
  }
  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {}

  return {
    trace,
    log,
  }
}
