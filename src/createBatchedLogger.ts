import { z, ZodType } from "zod"
import { throttle } from "lodash"
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryEntry,
  TelemetryLogEntry,
  TelemetryLogger,
  TelemetryTrace,
  TelemetryTraceEntry,
} from "./types.ts"

interface Options {
  flushInterval?: number
  // This allows us to switch strategy for resolving consent depending on context (e.g. studio/cli)
  resolveConsent: () => Promise<boolean>
  // This allows us to switch strategy for submitting log entries (e.g. using fetch in browser, or node server side)
  submitEntries: (events: TelemetryEntry[]) => Promise<unknown>
}

export function createBatchedLogger(
  sessionId: string,
  options: Options
): TelemetryLogger {
  const pending: TelemetryEntry[] = []

  const flush = throttle(
    () => {
      if (pending.length > 0) {
        const batch = pending.slice()
        pending.length = 0
        console.log("submitting", batch)
        options.submitEntries(batch) // todo: add error handling and recovery
      }
    },
    options.flushInterval ?? 30000,
    { leading: false, trailing: true }
  )

  function pushTraceEntry<Schema extends ZodType>(
    type: TelemetryTraceEntry["type"],
    traceId: string,
    trace: KnownTelemetryTrace,
    data?: unknown
  ) {
    pending.push({
      sessionId,
      type,
      traceId,
      event: trace.name,
      data,
      createdAt: new Date().toISOString(),
    })
    flush()
  }

  function pushLogEntry<Schema extends ZodType>(
    type: TelemetryLogEntry["type"],
    event: KnownTelemetryLogEvent,
    data?: unknown
  ) {
    pending.push({
      sessionId,
      type,
      event: event.name,
      data,
      createdAt: new Date().toISOString(),
    })
    flush()
  }
  function trace<Schema extends ZodType>(
    trace: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {
        pushTraceEntry("trace.start", traceId, trace)
      },
      log(data?: unknown) {
        pushTraceEntry("trace.log", traceId, trace, data)
      },
      complete() {
        pushTraceEntry("trace.complete", traceId, trace)
      },
      error(error: Error) {
        pushTraceEntry("trace.error", traceId, trace)
      },
    }
  }

  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>
  ) {
    pushLogEntry("log", event, data)
  }

  return {
    trace,
    log,
  }
}
