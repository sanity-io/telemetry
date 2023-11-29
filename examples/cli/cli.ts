import {parseArgs} from 'node:util'
import {
  ExampleCliAction,
  ExampleCliHelpCommand,
  ExampleCliInitCommand,
  ExampleCliStart,
} from '../../src/events'
import type {TelemetryEvent, TelemetryLogger} from '@sanity/telemetry'
import {createBatchedStore, createSessionId} from '@sanity/telemetry'
import {promises as readline} from 'node:readline'
import {stdin as input, stdout as output} from 'node:process'

async function resolveConsent() {
  return {
    status: process.env.TELEMETRY === 'false' ? 'denied' : 'granted',
  } as const
}

type CliContext = {telemetry: TelemetryLogger}

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

const actions: Record<string, (context: CliContext) => void> = {
  init: async function runInit(context: CliContext) {
    const trace = context.telemetry.trace(ExampleCliInitCommand)
    trace.start()
    trace.log({step: 'start'})
    const rl = readline.createInterface({input, output})
    await rl.question('Press enter to exit\n\n')
    rl.close()
    trace.log({step: 'end'})
    trace.complete()
  },
  help: async function runHelp(context: CliContext) {
    context.telemetry.log(ExampleCliHelpCommand)
    // eslint-disable-next-line no-console
    console.log('output some help!')
  },
}
function runAction(name: string, ctx: CliContext) {
  if (!(name in actions)) {
    throw new Error(`Unknown action "${name}"`)
  }
  return Promise.resolve(actions[name](ctx))
}

// imaginary cli entry point
async function cli(
  args: string[],
  flags: Record<string, string | boolean | undefined>,
  ctx: CliContext,
) {
  ctx.telemetry.log(ExampleCliStart, {nodeVersion: process.version})

  const action = ctx.telemetry.trace(ExampleCliAction)
  await action.await(
    runAction(args[0], {telemetry: action.newContext('runAction')}),
    {actionName: args[0]},
  )
}

process.on('beforeExit', async () => {
  await telemetryStore.flush()
})

// Run CLI  with telemetry instance in cli context
cli(positionals, values, {
  telemetry: telemetryStore.logger,
})
