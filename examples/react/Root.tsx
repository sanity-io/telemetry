import {ReactNode} from 'react'
import type {TelemetryEvent} from '@sanity/telemetry'
import {createBatchedStore, createSessionId} from '@sanity/telemetry'
import {TelemetryProvider} from '@sanity/telemetry/react'
import {StudioMount} from '@sanity/telemetry/events'

// Implementation of this could look at env vars, project consent, etc
async function resolveConsent() {
  return {status: 'granted'} as const
}

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

const apiUrl = 'http://localhost:5001/vX/intake/batch'

const sessionId = createSessionId()
const store = createBatchedStore(sessionId, {
  flushInterval: 1000 * 10,
  resolveConsent,
  sendEvents: (events) => sendEvents(apiUrl, events),
  sendBeacon: (events: TelemetryEvent[]) => sendBeacon(apiUrl, events),
})

export function Root({children}: {children: ReactNode}) {
  store.logger.log(StudioMount, {
    pluginVersions: [{pluginName: 'example-plugin', version: 'v2.1.0'}],
    studioVersion: 'v3.12.0',
  })

  return <TelemetryProvider store={store}>{children}</TelemetryProvider>
}
