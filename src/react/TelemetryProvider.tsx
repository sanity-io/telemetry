import { createContext } from "react"
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from "../types.ts"
import { createDefaultContext } from "./consoleLogger.ts"
import { z, ZodType, ZodUndefined } from "zod"
import { createNoopContext } from "./noopContext.ts"

/**
 * Note that `sessionId` is removed from the signature of these functions
 */
export interface TelemetryContextValue extends TelemetryLogger {
  /**
   * Convenience wrapper for tracing an async operartion
   * @param trace
   * @param promise
   */
  tracePromise<Schema extends ZodType>(
    trace: KnownTelemetryTrace<Schema>,
    promise: Promise<z.infer<Schema>>
  ): Promise<z.infer<Schema>>
}
const defaultContext = createDefaultContext()
/**
 * @internal
 */
export const TelemetryContext = createContext<TelemetryContextValue>(
  createNoopContext()
)

export function TelemetryProvider({
  children,
  logger = defaultContext,
}: {
  children: React.ReactNode
  logger?: TelemetryContextValue
}) {
  return (
    <TelemetryContext.Provider value={logger}>
      {children}
    </TelemetryContext.Provider>
  )
}
