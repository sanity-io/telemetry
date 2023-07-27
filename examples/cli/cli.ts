import {parseArgs} from 'node:util'
import {
  cliInitActionComplete,
  cliInitActionStart,
  cliStartEvent,
} from '../../src/events'
import type {TelemetryEvent, TelemetryLogger} from '@sanity/telemetry'
import {createBatchedStore, createSessionId} from '@sanity/telemetry'
import {promises as readline} from 'node:readline'
import {stdin as input, stdout as output} from 'node:process'

async function resolveConsent() {
  return process.env.TELEMETRY !== 'false'
}

const sessionId = createSessionId()

function submitEvents(entries: TelemetryEvent[]) {
  // eslint-disable-next-line no-console
  console.error('[debug] pretend submitting events:', JSON.stringify(entries))
  return Promise.resolve()
}

const telemetryStore = createBatchedStore(sessionId, {
  flushInterval: 2000,
  resolveConsent,
  sendEvents: submitEvents,
})

const {values, positionals} = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
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
async function cli(
  args: string[],
  flags: Record<string, string | boolean | undefined>,
  ctx: {telemetry: TelemetryLogger},
) {
  ctx.telemetry.log(cliStartEvent, {nodeVersion: process.version})
  ctx.telemetry.log(cliInitActionStart)
  if (args[0] === 'init') {
    const rl = readline.createInterface({input, output})
    await rl.question('Press enter to exit\n\n')
    rl.close()
  }
  ctx.telemetry.log(cliInitActionComplete)
}

process.on('beforeExit', async () => {
  await telemetryStore.flush()
})

// Run CLI  with telemetry instance in cli context
cli(positionals, values, {
  telemetry: telemetryStore.logger,
})
