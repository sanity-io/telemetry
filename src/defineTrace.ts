import {DefinedTelemetryTrace, TelemetryTraceOptions} from './types'

/**
 * @param options
 * */
export function defineTrace<Data = void>(
  options: TelemetryTraceOptions,
): DefinedTelemetryTrace<Data> {
  return {
    type: 'trace',
    name: options.name,
    version: options.version,
    description: options.description,
    schema: undefined as unknown as Data,
  }
}
