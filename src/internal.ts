import {
  KnownTelemetryEventName,
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogOptions,
  TelemetryTraceOptions,
} from "./types.ts"
import { undefined, z, ZodType, ZodUndefined } from "zod"
import { createLogger } from "vite"
import { createBatchedLogger } from "./react/fetchLogger.ts"
import { consoleLogger } from "./react/consoleLogger.ts"

/**
 * @param options
 * @internal - this has to be internal to guarantee that all events are defined centrally in this package
 */
export function _defineLogEvent<Schema extends ZodType>(
  options: TelemetryLogOptions<Schema>
): KnownTelemetryLogEvent<Schema> {
  return {
    type: "log",
    name: options.name as KnownTelemetryEventName,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: (options.schema || z.undefined()) as Schema,
  }
}

const ev = _defineLogEvent({
  name: "foo",
  displayName: "test",
  description: "ok",
  version: 1,
})

consoleLogger.log("xyz", ev)
const c = z.void()

/**
 * @param options
 * @internal - this has to be internal to guarantee that all events are defined centrally in this package
 * */
export function _defineTraceEvent<Schema extends ZodType>(
  options: TelemetryTraceOptions<Schema>
): KnownTelemetryTrace<Schema> {
  return {
    type: "trace",
    name: options.name as KnownTelemetryEventName,
    version: options.version,
    displayName: options.displayName,
    description: options.description,
    schema: options.schema,
  }
}
