# @sanity/telemetry

Utils for collecting telemetry data from Sanity CLI and Sanity Studio

# Configure logger for the environment/runtime:

```typescript
import {createBatchedLogger, createSessionId} from '@sanity/telemetry'

const sessionId = createSessionId()

const logger = createBatchedLogger(sessionId, {
   // submit events every 30s
  flushInterval: 30000,

  // implement user consent fetching
  resolveConsent: () => { /* todo */ },

  // implement sending events to backend
  submitEvents: (events) => { /* todo */ }
})
```
Once the logger has been configured, application code can start by calling either the `.log()` or `.trace()` method defined on it.

# Track a one-off event

```typescript
import {exampleEvent} from '@sanity/telemetry/events'

// All possible events needs to be defined in ./src/events in this package
logger.log(exampleEvent, {foo: "bar"})
```

# Track a group of events in a trace

A trace represents a long-lived action/task that has discrete steps and that may eventually complete or fail
A trace is useful for e.g.:
- Logging how long time a particular action takes
- Logging different events that happens while the user is performing a certain task (e.g. search)

Note: a trace may or may not complete. Trace events are submitted continuously as they happen (at the configured `flushInterval`)
```typescript

A trace i logger.log(exampleEvent, {foo: "bar"})
```
