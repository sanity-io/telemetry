import {z, ZodType} from 'zod'
import type {TelemetryContextValue} from '@sanity/telemetry/react'
import type {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryEntry,
  TelemetryTrace,
} from '@sanity/telemetry'

import {createBatchedLogger} from '@sanity/telemetry'

interface StudioContextLoggerOptions {
  // potential studio specific telemetry options
  flushInterval?: 1000
  resolveConsent: () => Promise<boolean>
  submitEntries: (events: TelemetryEntry[]) => Promise<unknown>
}
export function createStudioContextLogger(
  sessionId: string,
  options: StudioContextLoggerOptions,
): TelemetryContextValue {
  const batchedLogger = createBatchedLogger(sessionId, options)

  /** Convenience wrapper for tracing an async execution  */
  function tracePromise<Schema extends ZodType>(
    traceEvent: KnownTelemetryTrace<Schema>,
    promise: Promise<z.infer<Schema>>,
  ): Promise<z.infer<Schema>> {
    const tr = batchedLogger.trace(traceEvent)
    tr.start()
    return promise.then(
      (result) => {
        tr.log(result)
        tr.complete()
        return result
      },
      (error) => {
        tr.error(error)
      },
    )
  }

  return {
    log<Schema extends ZodType = ZodType>(
      event: KnownTelemetryLogEvent<Schema>,
      data?: z.infer<Schema>,
    ) {
      batchedLogger.log(event, data)
    },
    trace<Schema extends ZodType = ZodType>(
      event: KnownTelemetryTrace<Schema>,
    ): TelemetryTrace<Schema> {
      return batchedLogger.trace(event)
    },
    tracePromise,
  }
}
