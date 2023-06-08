import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from "../types.ts"
import { z, ZodType } from "zod"

export const consoleLogger: TelemetryLogger = {
  trace<Schema extends ZodType>(
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
  },
  log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>
  ) {
    console.log(`[telemetry][${event.displayName}@${event.version}] log`, data)
  },
}
