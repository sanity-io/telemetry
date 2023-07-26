import type React from 'react'
import {createContext} from 'react'
import {TelemetryLogger} from '../types'
import {createNoopLogger} from './noopContext'

/**
 * @internal
 */
export const TelemetryContext = createContext<TelemetryLogger>(
  createNoopLogger(),
)

export function TelemetryProvider({
  children,
  logger,
}: {
  children: React.ReactNode
  logger: TelemetryLogger
}) {
  return (
    <TelemetryContext.Provider value={logger}>
      {children}
    </TelemetryContext.Provider>
  )
}
