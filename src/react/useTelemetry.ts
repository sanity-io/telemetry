import { TelemetryLogger } from "../types.ts"
import { useContext } from "react"
import { telemetryContext } from "./Provider.tsx"

export function useTelemetry(): TelemetryLogger {
  return useContext(telemetryContext)
}
