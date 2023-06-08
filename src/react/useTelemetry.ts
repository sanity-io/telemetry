import { useContext } from "react"
import {
  TelemetryContext,
  TelemetryContextValue,
} from "./TelemetryProvider.tsx"

export function useTelemetry(): TelemetryContextValue {
  return useContext(TelemetryContext)
}
