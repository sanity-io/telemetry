import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  LoggedEvent,
  TelemetryLogger,
  TelemetryTrace,
} from "../types.ts"
import { z, ZodType } from "zod"
import { throttle } from "lodash"

interface FetchLoggerOptions {
  flushInterval: 1000
}

export const createBatchedLogger = (
  options: FetchLoggerOptions,
  submit: (events: LoggedEvent[]) => Promise<void>
): TelemetryLogger => {
  const queue: LoggedEvent[] = []

  const flush = throttle(
    () => {
      if (queue.length > 0) {
        const batch = queue.slice()
        submit(batch)
      }
    },
    options.flushInterval,
    { trailing: true }
  )

  const log = (event: KnownTelemetryLogEvent, data?: unknown) => {
    queue.push({ event: event.name, data })
    flush()
  }
  return {
    trace<Schema extends ZodType>(
      sessionId: string,
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
      sessionId: string,
      event: KnownTelemetryLogEvent<Schema>,
      data?: z.infer<Schema>
    ) {
      console.log(
        `[telemetry][${event.displayName}@${event.version}] log`,
        data
      )
    },
  }
}
