import { parseArgs } from "node:util"
import { cliStartEvent } from "./src/packages/telemetry/events"
import {
  KnownTelemetryLogEvent,
  KnownTelemetryTrace,
  TelemetryLogger,
  TelemetryTrace,
} from "./src/packages/telemetry/types"
import { z, ZodType } from "zod"
const args = ["-f", "--bar", "b"]
const options = {
  foo: {
    type: "boolean",
    short: "f",
  },
  bar: {
    type: "string",
  },
} as const
const { values, positionals } = parseArgs({ args, options })

function cli(positionals, args, ctx: { telemetry: TelemetryLogger }) {
  ctx.telemetry.log(cliStartEvent)
}

const consoleLogger: TelemetryLogger = {
  trace<Schema extends ZodType>(
    trace: KnownTelemetryTrace<Schema>
  ): TelemetryTrace<Schema> {
    const traceId = Math.random().toString(36).substr(2, 9)
    return {
      start() {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] start`,
          traceId
        )
      },
      log(data?: unknown) {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] log`,
          data
        )
      },
      complete() {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] complete`
        )
      },
      error(error: Error) {
        console.log(
          `[telemetry][${trace.displayName}@${trace.version}][${traceId}] error`,
          error
        )
      },
    }
  },
  log<Schema extends ZodType>(
    event: KnownTelemetryLogEvent<Schema>,
    data?: z.infer<Schema>
  ) {
    console.log(`[telemetry][${event.displayName}@${event.version}] log`, data)
  },
}

// setup telemetry in cli entry point
cli(positionals, values, { telemetry: consoleLogger })
