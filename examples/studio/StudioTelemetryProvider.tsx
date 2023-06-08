import { TelemetryProvider } from "@sanity/telemetry/react"
import { ReactNode, useMemo } from "react"
import { TelemetryEntry } from "../../src/types.ts"
import { studioSessionStart } from "@sanity/telemetry/events"
import { createStudioContextLogger } from "./createStudioContextLogger.ts"

// Implementation of this could look at env vars, project consent, etc
async function resolveConsent(): Promise<boolean> {
  return true
}

function useStudioLogger() {
  return useMemo(() => {}, [])
}

const STUDIO_VERSION = "v3.12.0"
const PLUGIN_VERSIONS = [{ pluginName: "example-plugin", version: "v2.1.0" }]
function submitEntries(entries: TelemetryEntry[]) {
  return fetch("https://telemetry.sanity.io/api/v1/log", {
    method: "POST",
    body: JSON.stringify(entries),
    // …etc
  })
}
const sessionId = Math.random().toString(32).substring(2)
export function StudioTelemetryProvider({ children }: { children: ReactNode }) {
  // This is how we could set up telemetry in the studio
  const logger = useMemo(() => {
    return createStudioContextLogger(sessionId, {
      resolveConsent,
      submitEntries: submitEntries,
    })
  }, [])

  logger.log(studioSessionStart, {
    pluginVersions: PLUGIN_VERSIONS,
    studioVersion: STUDIO_VERSION,
  })

  return <TelemetryProvider logger={logger}>{children}</TelemetryProvider>
}
