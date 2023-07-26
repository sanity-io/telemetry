/* eslint-disable no-console */
import type {
  TelemetryEvent,
  TelemetryLogEvent,
  TelemetryTraceEvent,
} from '../types'
import {TelemetryStore} from '../types'
import {createStore} from '../createStore'
import {SessionId} from '../createSessionId'

function formatLogEvent(event: TelemetryLogEvent) {
  return [
    `[telemetry][${event.name}@${event.version}][${event.type}]}`,
    event.data,
  ]
}
function formatTraceEvent(trace: TelemetryTraceEvent) {
  return [
    `[telemetry][${trace.name}@${trace.version}][${trace.type}]}`,
    ...(trace.type === 'trace.log' ? [trace.data] : []),
  ]
}
function formatEvent(event: TelemetryEvent) {
  return event.type == 'log' ? formatLogEvent(event) : formatTraceEvent(event)
}

export function createConsoleLogStore(sessionId: SessionId): TelemetryStore {
  const store = createStore(sessionId)

  function log(event: TelemetryEvent) {
    console.log(...formatEvent(event))
  }

  const subscription = store.events$.subscribe(log)
  return {
    logger: store.logger,
    destroy: () => {
      subscription.unsubscribe()
    },
    flush: () => {
      /* noop as all events are logged to the console immediately */
      return Promise.resolve()
    },
  }
}
