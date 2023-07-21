import {createContext} from 'react'
import type React from 'react'
import {TelemetryLogger} from '../types.ts'
import {createDefaultContext} from './consoleLogger.ts'
import {createNoopContext} from './noopContext.ts'

const defaultContext = createDefaultContext()
/**
 * @internal
 */
export const TelemetryContext = createContext<TelemetryLogger>(
  createNoopContext(),
)

export function TelemetryProvider({
  children,
  logger = defaultContext,
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
