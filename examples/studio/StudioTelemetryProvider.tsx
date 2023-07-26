import {ReactNode, useEffect, useMemo} from 'react'
import type {TelemetryEvent} from '@sanity/telemetry'
import {createBatchedStore, createSessionId} from '@sanity/telemetry'
import {TelemetryProvider} from '@sanity/telemetry/react'
import {studioSessionStart} from '@sanity/telemetry/events'

// Implementation of this could look at env vars, project consent, etc
async function resolveConsent(): Promise<boolean> {
  return true
}

const STUDIO_VERSION = 'v3.12.0'
const PLUGIN_VERSIONS = [{pluginName: 'example-plugin', version: 'v2.1.0'}]
function submitEvents(entries: TelemetryEvent[]) {
  console.log('Pretend submitting events: ', entries)
  // return fetch('https://telemetry.sanity.io/api/v1/log', {
  //   method: 'POST',
  //   body: JSON.stringify(entries),
  //   // …etc
  // })
  return Promise.resolve()
}
const sessionId = createSessionId()
export function StudioTelemetryProvider({children}: {children: ReactNode}) {
  // This is how we could set up telemetry in the studio
  const store = useMemo(() => {
    return createBatchedStore(sessionId, {
      flushInterval: 10000,
      resolveConsent,
      submitEvents,
    })
  }, [])

  useEffect(() => {
    store.logger.log(studioSessionStart, {
      pluginVersions: PLUGIN_VERSIONS,
      studioVersion: STUDIO_VERSION,
    })
  }, [store])

  return <TelemetryProvider logger={store.logger}>{children}</TelemetryProvider>
}
