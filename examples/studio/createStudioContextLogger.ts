import {z, ZodType} from 'zod'

import type {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryEntry,
  TelemetryLogger,
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
): TelemetryLogger {
  const batchedLogger = createBatchedLogger(sessionId, options)

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
  }
}
