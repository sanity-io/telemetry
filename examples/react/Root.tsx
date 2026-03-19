import {ReactNode, useEffect, useState} from 'react'
import type {TelemetryEvent, TelemetryStore} from '@sanity/telemetry'
import {createBatchedStore, createSessionId} from '@sanity/telemetry'
import {
  DeferredTelemetryProvider,
  TelemetryProvider,
  useTelemetry,
} from '@sanity/telemetry/react'
import {StudioMount} from './studio.telemetry'

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

function useStore(): TelemetryStore<unknown> | undefined {
  const [store, setStore] = useState<TelemetryStore<unknown>>()

  useEffect(() => {
    // Simulate async store creation (e.g. waiting for auth/consent)
    const timeout = setTimeout(() => {
      const sessionId = createSessionId()
      setStore(
        createBatchedStore(sessionId, {
          flushInterval: 1000 * 10,
          resolveConsent,
          sendEvents: (events) => sendEvents(apiUrl, events),
          sendBeacon: (events: TelemetryEvent[]) =>
            sendBeacon(apiUrl, events),
        }),
      )
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  return store
}

// Logs a startup event using useTelemetry() — this fires before
// the real store is ready, so events are buffered by DeferredTelemetryProvider
function StartupLogger({children}: {children: ReactNode}) {
  const logger = useTelemetry()

  useEffect(() => {
    logger.log(StudioMount, {
      pluginVersions: [{pluginName: 'example-plugin', version: 'v2.1.0'}],
      studioVersion: 'v3.12.0',
    })
  }, [logger])

  return <>{children}</>
}

export function Root({children}: {children: ReactNode}) {
  const store = useStore()

  return (
    <DeferredTelemetryProvider>
      <StartupLogger>
        {store ? (
          <TelemetryProvider store={store}>{children}</TelemetryProvider>
        ) : (
          children
        )}
      </StartupLogger>
    </DeferredTelemetryProvider>
  )
}
