# @sanity/telemetry

Utils for collecting telemetry data from Sanity CLI and Sanity Studio

## Configure telemetry store for the environment/runtime

### Browser

```typescript
import {createBatchedStore, createSessionId} from '@sanity/telemetry'

const sessionId = createSessionId()

const store = createBatchedStore(sessionId, {

  // submit any pending events every 30s
  flushInterval: 30000,

  // implement user consent resolving
  resolveConsent: () => {
    //…
  },

  // implement sending events to backend
  sendEvents: (events) => {
    //…
  }

  // opt into a different strategy for sending events when the browser close, reload or navigate away from the current page (optional)
  sendBeacon: (events) => {
    //…
  }
})


// Make sure to send collected events before the user navigates away
// This makes sure that the browser flushes any pending events before the user navigates away
setupLifeCycleListeners(store)
```

### React

```typescript jsx
import {createBatchedStore, createSessionId} from '@sanity/telemetry'

const sessionId = createSessionId()

const store = createBatchedStore(sessionId, {

  // submit any pending events every 30s
  flushInterval: 30000,

  // implement user consent resolving
  resolveConsent: () => {
    //…
  },

  // implement sending events to backend
  sendEvents: (events) => {
    //…
  }

  // opt into a different strategy for sending events when the browser close, reload or navigate away from the current page (recommended)
  sendBeacon: (events) => {
    //…
  }
})

// Wrap the app in a TelemetryProvider
// This will enable usage of the `useTelemetry()` hook
function Root() {

  // Hook the telemetry store up to page life cycle events like hide/unload
  useTelemetryStoreLifeCycleEvents(store)

  return (
    <TelemetryProvider store={store}>
      <App />
    </TelemetryProvider>
  )
}

```

### Node.js/CLI

```typescript
import {createBatchedStore, createSessionId} from '@sanity/telemetry'

const sessionId = createSessionId()

const store = createBatchedStore(sessionId, {

  // submit any pending events every 30s
  flushInterval: 30000,

  // implement user consent resolving
  resolveConsent: () => {
    //…
  },

  // implement sending events to backend
  sendEvents: (events) => {
    //…
  },
})

// Make sure to send collected events before exiting the application
process.on('beforeExit', async () => telemetryStore.end())
```

Once the logger has been configured, application code can start by calling either the `.log()` or `.trace()` method
defined on it.

### Track a one-off event

```typescript
// All possible events needs to be exported from ./src/events in this package
import {exampleEvent} from '@sanity/telemetry/events'

logger.log(exampleEvent, {foo: 'bar'})
```

### Track a group of events in a trace

A trace represents a long-lived action/task that has discrete steps and that may eventually complete or fail
A trace is useful for e.g.:

- Logging how long time a particular action takes
- Logging different events that occurs while the user is performing a certain task (e.g. search)

A trace may complete or fail or never complete at all. Trace events are submitted continuously as they happen, at the
configured `flushInterval`

```typescript
import {exampleTrace} from '@sanity/telemetry/events'

const trace = logger.trace(exampleTrace)

// mark the beginning of the trace
trace.start()

try {
  await performSomeAction()
  trace.log({step: 'action-performed'})
  await doSomethingAsync()
  trace.log({step: 'something-async-done'})
  trace.complete()
} catch (error) {
  // mark the trace as failed
  trace.fail(error)
}
```

### Trace promise helper

As an alternative, you can also use the `wrapPromise` helper to automatically mark the trace as completed or failed when
the promise resolves or rejects:

```typescript
async function performSomeAction() {
  //…
}
const trace = logger.trace(exampleTrace)
const res = trace.wrapPromise(performSomeAction())
```

This will return the same promise as `performSomeAction()`, but the trace will be marked as completed or failed when the
promise resolves or rejects
