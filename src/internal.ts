import {
  KnownTelemetryEventName,
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogOptions,
  TelemetryTraceOptions,
} from './types'
import {z, ZodType, ZodUndefined} from 'zod'

/**
 * @deprecated - Do not use in production
 */
export type DevelopmentTelemetryEvent<Schema extends ZodType = ZodUndefined> =
  KnownTelemetryLogEvent<Schema> & {dev: true}

/**
 * @deprecated - Do not use in production
 */
export type DevelopmentTelemetryTrace<Schema extends ZodType = ZodUndefined> =
  KnownTelemetryTrace<Schema> & {dev: true}

/**
 * @deprecated - Do not use in production
 */
export function _devDefineLogEvent<Schema extends ZodType = ZodUndefined>(
  options: TelemetryLogOptions<Schema>,
): DevelopmentTelemetryEvent<Schema> {
  return {..._devDefineLogEvent(options), dev: true}
}
/**
 * @deprecated - Do not use in production
 */
export function _devDefineTraceEvent<Schema extends ZodType = ZodUndefined>(
  options: TelemetryTraceOptions<Schema>,
): DevelopmentTelemetryTrace<Schema> {
  return {..._defineTraceEvent(options), dev: true}
}
/**
 * @param options
 * @internal - this has to be internal to guarantee that all events are defined centrally in this package
 */
export function _defineLogEvent<Schema extends ZodType = ZodUndefined>(
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
export function _defineTraceEvent<Schema extends ZodType = ZodUndefined>(
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
