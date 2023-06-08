import { createContext } from "react"
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from "../types.ts"
import { z, ZodType } from "zod"
import { consoleLogger } from "./consoleLogger.ts"

/**
 * @internal
 */
export const TelemetryContext = createContext(consoleLogger)

export function TelemetryProvider({
  children,
  logger = consoleLogger,
}: {
  children: React.ReactNode
  logger?: TelemetryLogger
}) {
  return (
    <TelemetryContext.Provider value={logger}>
      {children}
    </TelemetryContext.Provider>
  )
}
