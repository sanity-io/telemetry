import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryTrace,
} from "../types.ts"
import { z, ZodType } from "zod"
import { TelemetryContextValue } from "./TelemetryProvider.tsx"

export function createDefaultContext(): TelemetryContextValue {
  function trace<Schema extends ZodType>(
    trace: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] start`,
          traceId
        )
      },
      log(data?: unknown) {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] log`,
          data
        )
      },
      complete() {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] complete`
        )
      },
      error(error: Error) {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] error`,
          error
        )
      },
    }
  }
  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>
  ) {
    console.log(`[telemetry][${event.displayName}@${event.version}] log`, data)
  }

  /** Convenience wrapper for tracing an async execution  */
  function tracePromise<Schema extends ZodType>(
    traceEvent: KnownTelemetryTrace<Schema>,
    promise: Promise<z.infer<Schema>>
  ): Promise<z.infer<Schema>> {
    const tr = trace(traceEvent)
    tr.start()
    return promise.then(
      (result) => {
        tr.log(result)
        tr.complete()
        return result
      },
      (error) => {
        tr.error(error)
      }
    )
  }

  return {
    trace,
    log,
    tracePromise,
  }
}
