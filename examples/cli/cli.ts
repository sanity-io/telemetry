import { parseArgs } from "node:util"
import { cliInitActionEvent, cliStartEvent } from "@sanity/telemetry/events"
import { TelemetryEntry, TelemetryLogger } from "@sanity/telemetry"
import { createCliTelemetryLogger } from "./createCliTelemetryLogger.ts"

async function resolveConsent() {
  return process.env.TELEMETRY !== "false"
}
// todo make proper unique
const sessionId = Math.random().toString(32).substring(2)

function submitEntries(entries: TelemetryEntry[]) {
  return fetch("https://telemetry.sanity.io/api/v1/log", {
    method: "POST",
    body: JSON.stringify(entries),
    // …etc
  })
}

const telemetry = createCliTelemetryLogger(sessionId, {
  resolveConsent: resolveConsent,
  submitEntries,
})

const { values, positionals } = parseArgs({
  args: ["-f", "--bar", "b"],
  options: {
    foo: {
      type: "boolean",
      short: "f",
    },
    bar: {
      type: "string",
    },
  },
})

// imaginary cli entry point
function cli(
  args: string[],
  flags: Record<string, string | boolean | undefined>,
  ctx: { telemetry: TelemetryLogger }
) {
  ctx.telemetry.log(cliStartEvent, { nodeVersion: process.version })

  if (args[0] === "init") {
    ctx.telemetry.log(cliInitActionEvent)
    // run init…
  }
}

// Run CLI  with telemetry instance in cli context
cli(positionals, values, {
  telemetry,
})
