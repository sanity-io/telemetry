import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryTrace,
} from "../types.ts"
import { z, ZodType } from "zod"
import { TelemetryContextValue } from "./TelemetryProvider.tsx"

export function createNoopContext(): TelemetryContextValue {
  function trace<Schema extends ZodType>(
    trace: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {},
      log(data?: unknown) {},
      complete() {},
      error(error: Error) {},
    }
  }
  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>
  ) {}

  /** Convenience wrapper for tracing an async execution  */
  function tracePromise<Schema extends ZodType>(
    traceEvent: KnownTelemetryTrace<Schema>,
    promise: Promise<z.infer<Schema>>
  ): Promise<z.infer<Schema>> {
    return promise
  }

  return {
    trace,
    log,
    tracePromise,
  }
}
