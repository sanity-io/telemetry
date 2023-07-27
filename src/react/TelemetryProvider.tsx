import type React from 'react'
import {createContext} from 'react'
import {TelemetryLogger, TelemetryStore} from '../types'
import {createNoopLogger} from './noopContext'
import {useTelemetryStoreLifeCycleEvents} from './useTelemetryStoreLifeCycleEvents'

/**
 * @internal
 */
export const TelemetryLoggerContext = createContext<TelemetryLogger>(
  createNoopLogger(),
)

export function TelemetryProvider({
  children,
  store,
}: {
  children: React.ReactNode
  store: TelemetryStore
}) {
  // Hook the telemetry store up to page life cycle events like hide/unload
  useTelemetryStoreLifeCycleEvents(store)

  return (
    <TelemetryLoggerContext.Provider value={store.logger}>
      {children}
    </TelemetryLoggerContext.Provider>
  )
}
