import {TelemetryEvent, TelemetryStore} from './types'
import {
  catchError,
  concatMap,
  EMPTY,
  filter,
  from,
  lastValueFrom,
  map,
  mergeMap,
  tap,
  throttleTime,
} from 'rxjs'
import {SessionId} from './createSessionId'
import {createStore} from './createStore'

export interface CreateBatchedStoreOptions {
  flushInterval?: number
  // This allows us to switch strategy for resolving consent depending on context (e.g. studio/cli)
  resolveConsent: () => Promise<boolean>
  // This allows us to switch strategy for submitting log entries (e.g. using fetch in browser, or node server side)
  submitEvents: (events: TelemetryEvent[]) => Promise<unknown>
}

export function createBatchedStore(
  sessionId: SessionId,
  options: CreateBatchedStoreOptions,
): TelemetryStore {
  const store = createStore(sessionId)

  let consentFetchedPromise: Promise<boolean> | null = null

  function fetchConsent() {
    if (consentFetchedPromise == null) {
      consentFetchedPromise = options.resolveConsent().catch((err) => {
        // if we for some reason can't fetch consent we treat it as a "no", and try again at next flush
        consentFetchedPromise = null
        return false
      })
    }
    return consentFetchedPromise
  }

  const _buffer: TelemetryEvent[] = []

  function consume() {
    const buf = _buffer.slice()
    _buffer.length = 0
    return buf
  }

  function submit(events: TelemetryEvent[]) {
    return from(fetchConsent()).pipe(
      mergeMap((consented) =>
        consented ? options.submitEvents(events) : EMPTY,
      ),
    )
  }

  const flushInterval = options.flushInterval ?? 30000

  const flush$ = store.events$.pipe(
    tap((ev) => _buffer.push(ev)),
    map(() => {}), // void to avoid accidental use of events further down the pipe
    throttleTime(flushInterval, undefined, {trailing: true}),
    map(() => consume()),
    filter((pending) => pending.length > 0),
    concatMap((pending) =>
      submit(pending).pipe(
        catchError((err) => {
          // In case of error, put events back on the buffer
          _buffer.push(...pending)
          // and ignore the error
          return EMPTY
        }),
      ),
    ),
  )

  function flush() {
    return lastValueFrom(submit(consume())).then(() => {})
  }

  // start subscribing to events
  const subscription = flush$.subscribe()

  return {
    destroy: () => {
      // flush before destroying
      return lastValueFrom(submit(consume()))
        .then(
          () => {}, // void promise
          () => {}, // ignore errors
        )
        .finally(() => {
          subscription.unsubscribe()
        })
    },
    // Note: flush may fail
    flush,
    logger: store.logger,
  }
}
