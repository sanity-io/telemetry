import {parseArgs} from 'node:util'
import {cliInitActionEvent, cliStartEvent} from '@sanity/telemetry/events'
import type {TelemetryEntry, TelemetryLogger} from '@sanity/telemetry'
import {createBatchedLogger, createSessionId} from '@sanity/telemetry'

async function resolveConsent() {
  return process.env.TELEMETRY !== 'false'
}

// todo make proper unique
const sessionId = createSessionId()

function submitEntries(entries: TelemetryEntry[]) {
  // eslint-disable-next-line no-console
  console.log('Submit events: ', entries)
  return Promise.resolve()
}

const telemetry = createBatchedLogger(sessionId, {
  flushInterval: 2000,
  resolveConsent,
  submitEntries,
})

const {values, positionals} = parseArgs({
  args: ['-f', '--bar', 'b'],
  options: {
    foo: {
      type: 'boolean',
      short: 'f',
    },
    bar: {
      type: 'string',
    },
  },
})

// imaginary cli entry point
function cli(
  args: string[],
  flags: Record<string, string | boolean | undefined>,
  ctx: {telemetry: TelemetryLogger},
) {
  ctx.telemetry.log(cliStartEvent, {nodeVersion: process.version})

  if (args[0] === 'init') {
    ctx.telemetry.log(cliInitActionEvent)
    // run init…
  }
}

// Run CLI  with telemetry instance in cli context
console.log('Running CLI')
cli(positionals, values, {
  telemetry,
})
process.on('exit', () => {
  console.log('Exiting CLI')
})
