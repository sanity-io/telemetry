import {ReactNode} from 'react'
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

function sendBeacon(url: string, payload: TelemetryEvent[]) {
  return navigator.sendBeacon(
    url,
    new Blob([JSON.stringify(payload)], {
      type: 'text/plain',
    }),
  )
}

function sendEvents(url: string, entries: TelemetryEvent[]) {
  return fetch(url, {
    keepalive: true,
    method: 'POST',
    body: JSON.stringify(entries),
    // …etc
  })
}

const apiUrl = 'https://telemetry.sanity.io'

const sessionId = createSessionId()
const store = createBatchedStore(sessionId, {
  flushInterval: 1000 * 10,
  resolveConsent,
  sendEvents: (events) => sendEvents(`${apiUrl}/api/v1/batch`, events),
  sendBeacon: (events: TelemetryEvent[]) =>
    sendBeacon(`${apiUrl}/api/v1/beacon`, events),
})

store.logger.log(studioSessionStart, {
  pluginVersions: PLUGIN_VERSIONS,
  studioVersion: STUDIO_VERSION,
})

export function Root({children}: {children: ReactNode}) {
  return <TelemetryProvider store={store}>{children}</TelemetryProvider>
}
