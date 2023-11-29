import {
  DefinedTelemetryLog,
  DefinedTelemetryTrace,
  TelemetryLogOptions,
  TelemetryTraceOptions,
} from './types'

/**
 * @param options
 */
export function defineLogEvent<Data = void>(
  options: TelemetryLogOptions,
): DefinedTelemetryLog<Data> {
  return {
    type: 'log',
    name: options.name,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: undefined as unknown as Data,
  }
}

/**
 * @param options
 * */
export function defineTraceEvent<Data = void>(
  options: TelemetryTraceOptions,
): DefinedTelemetryTrace<Data> {
  return {
    type: 'trace',
    name: options.name,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: undefined as unknown as Data,
  }
}
