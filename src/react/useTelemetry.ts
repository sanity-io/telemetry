import {useContext} from 'react'
import {TelemetryContext} from './TelemetryProvider'
import type {TelemetryLogger} from '../'

export function useTelemetry(): TelemetryLogger {
  return useContext(TelemetryContext)
}
