import type {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from '../types'
import {TypeOf, z, ZodType} from 'zod'

export function createNoopLogger(): TelemetryLogger {
  const logger = {
    trace,
    log,
  }
  function trace<Schema extends ZodType>(
    telemetryTrace: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    return {
      start() {},
      log(data?: unknown) {},
      complete() {},
      newContext(name: string) {
        return logger
      },
      error(error: Error) {},
      await: (promise) => promise,
    }
  }

  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {}

  return logger
}
