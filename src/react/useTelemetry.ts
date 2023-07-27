import {useContext} from 'react'
import {TelemetryLoggerContext} from './TelemetryProvider'
import type {TelemetryLogger} from '../'

export function useTelemetry(): TelemetryLogger {
  return useContext(TelemetryLoggerContext)
}
