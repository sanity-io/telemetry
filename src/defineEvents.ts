import {
  KnownTelemetryEventName,
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogOptions,
  TelemetryTraceOptions,
} from './types'
import {z, ZodType, ZodUndefined} from 'zod'

/**
 * @param options
 * @internal - this has to be internal to guarantee that all events are defined centrally in this package
 */
export function defineLogEvent<Schema extends ZodType = ZodUndefined>(
  options: TelemetryLogOptions<Schema>,
): KnownTelemetryLogEvent<Schema> {
  return {
    type: 'log',
    name: options.name as KnownTelemetryEventName,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: (options.schema || z.undefined()) as Schema,
  }
}
/**
 * @param options
 * @internal - this has to be internal to guarantee that all events are defined centrally in this package
 * */
export function defineTraceEvent<Schema extends ZodType = ZodUndefined>(
  options: TelemetryTraceOptions<Schema>,
): KnownTelemetryTrace<Schema> {
  return {
    type: 'trace',
    name: options.name as KnownTelemetryEventName,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: (options.schema || z.undefined()) as Schema,
  }
}
