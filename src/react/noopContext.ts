import type {
  DefinedTelemetryLog,
  DefinedTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from '../types'
import {TypeOf, z, ZodType} from 'zod'

export function createNoopLogger<
  UserProperties,
>(): TelemetryLogger<UserProperties> {
  const logger = {
    updateUserProperties() {},
    trace,
    log,
  }
  function trace<Data>(
    telemetryTrace: DefinedTelemetryTrace<Data>,
  ): TelemetryTrace<UserProperties, Data> {
    return {
      start() {},
      log(data?: unknown) {},
      complete() {},
      newContext(name: string) {
        return logger
      },
      error(error: Error) {},
      await: (promise: Promise<Data>) => promise,
    }
  }

  function log<Schema extends ZodType>(
    event: DefinedTelemetryLog<Schema>,
    data?: z.infer<Schema>,
  ) {}

  return logger
}
