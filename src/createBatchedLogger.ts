import {z, ZodType} from 'zod'
import {throttle} from 'lodash'
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryEntry,
  TelemetryLogEntry,
  TelemetryLogger,
  TelemetryTrace,
  TelemetryTraceEntry,
} from './types.ts'

export interface CreateBatchedLoggerOptions {
  flushInterval?: number
  // This allows us to switch strategy for resolving consent depending on context (e.g. studio/cli)
  resolveConsent: () => Promise<boolean>
  // This allows us to switch strategy for submitting log entries (e.g. using fetch in browser, or node server side)
  submitEntries: (events: TelemetryEntry[]) => Promise<unknown>
}

export function createBatchedLogger(
  sessionId: string,
  options: CreateBatchedLoggerOptions,
): TelemetryLogger {
  const pending: TelemetryEntry[] = []

  let fetchConsent: Promise<boolean> | null = null

  const flush = throttle(
    async () => {
      if (fetchConsent === null) {
        fetchConsent = options.resolveConsent().catch((err) => {
          // if we for some reason can't fetch consent we treat it as a "no", and try again at next flush
          fetchConsent = null
          return false
        })
      }
      const consented = await fetchConsent
      if (!consented) {
        pending.length = 0
        return
      }
      if (pending.length > 0) {
        const batch = pending.slice()
        pending.length = 0
        options.submitEntries(batch) // todo: add error handling and recovery
      }
    },
    options.flushInterval ?? 30000,
    {leading: false, trailing: true},
  )

  function pushTraceEntry<Schema extends ZodType>(
    type: TelemetryTraceEntry['type'],
    traceId: string,
    telemetryTrace: KnownTelemetryTrace,
    data?: unknown,
  ) {
    pending.push({
      sessionId,
      type,
      traceId,
      event: telemetryTrace.name,
      version: telemetryTrace.version,
      data,
      createdAt: new Date().toISOString(),
    })
    flush()
  }

  function pushLogEntry<Schema extends ZodType>(
    type: TelemetryLogEntry['type'],
    event: KnownTelemetryLogEvent,
    data?: unknown,
  ) {
    pending.push({
      sessionId,
      type,
      version: event.version,
      event: event.name,
      data,
      createdAt: new Date().toISOString(),
    })
    flush()
  }
  function trace<Schema extends ZodType>(
    telemetryTrace: KnownTelemetryTrace<Schema>,
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {
        pushTraceEntry('trace.start', traceId, telemetryTrace)
      },
      log(data?: unknown) {
        pushTraceEntry('trace.log', traceId, telemetryTrace, data)
      },
      complete() {
        pushTraceEntry('trace.complete', traceId, telemetryTrace)
      },
      error(error: Error) {
        pushTraceEntry('trace.error', traceId, telemetryTrace)
      },
    }
  }

  function log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>,
  ) {
    pushLogEntry('log', event, data)
  }

  return {
    trace,
    log,
  }
}
