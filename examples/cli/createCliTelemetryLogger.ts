import type { TelemetryEntry, TelemetryLogger } from "@sanity/telemetry"
import { createBatchedLogger } from "@sanity/telemetry"

interface Options {
  flushInterval?: number
  resolveConsent: () => Promise<boolean>
  submitEntries: (events: TelemetryEntry[]) => Promise<unknown>
}

interface CLITelemetryLogger extends TelemetryLogger {}
export function createCliTelemetryLogger(
  sessionId: string,
  options: Options
): CLITelemetryLogger {
  const batchedLogger = createBatchedLogger(sessionId, options)
  // we can add convenience methods to the CLI logger here
  return batchedLogger
}
