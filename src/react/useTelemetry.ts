import {useContext} from 'react'
import {TelemetryContext} from './TelemetryProvider.tsx'
import type {TelemetryLogger} from '../'

export function useTelemetry(): TelemetryLogger {
  return useContext(TelemetryContext)
}
