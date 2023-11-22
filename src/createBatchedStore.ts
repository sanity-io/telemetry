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
  Observable,
  tap,
  throttle,
  throttleTime,
} from 'rxjs'
import {SessionId} from './createSessionId'
import {createStore} from './createStore'

const unrefTimer = (ms: number) =>
  new Observable((subscriber) => {
    const timeout = setTimeout(() => subscriber.next(), ms)
    if (typeof timeout.unref === 'function') {
      // unref the timeout to avoid holding the process open in node.js
      timeout.unref()
    }
    return () => clearTimeout(timeout)
  })

export interface CreateBatchedStoreOptions {
  /**
   * Optionally provide a flush interval
   */
  flushInterval?: number

  /**
   *  Provide a strategy for resolving consent depending on context (e.g. studio/cli)
   *  @public
   */
  resolveConsent: () => Promise<boolean>
  /**
   * Provide a strategy for submitting events (e.g. using fetch in browser, or node server side)
   * @public
   */
  sendEvents: (events: TelemetryEvent[]) => Promise<unknown>

  /**
   * Optionally provide a strategy for submitting final events (e.g. events that's queued when the browser exits)
   * @public
   */
  sendBeacon?: (events: TelemetryEvent[]) => boolean
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
    if (events.length === 0) {
      return EMPTY
    }
    return from(fetchConsent()).pipe(
      mergeMap((consented) => (consented ? options.sendEvents(events) : EMPTY)),
    )
  }

  const flushInterval = options.flushInterval ?? 30000

  const flush$ = store.events$.pipe(
    tap((ev) => _buffer.push(ev)),
    map(() => {}), // void to avoid accidental use of events further down the pipe
    throttle(() => unrefTimer(flushInterval), {
      leading: false,
      trailing: true,
    }),
    map(() => consume()),
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
    return lastValueFrom(submit(consume()), {
      defaultValue: undefined,
    }).then(() => {})
  }

  // start subscribing to events
  const subscription = flush$.subscribe()

  function endWithBeacon() {
    if (!options.sendBeacon) {
      // we don't have a beacon strategy, so we just flush - this may make us lose events, but it's the best we can do
      end()
      return true
    }
    const events = consume()
    subscription.unsubscribe()
    return events.length > 0 ? options.sendBeacon(events) : true
  }

  function end() {
    // flush before destroying
    return flush()
      .then(
        () => {}, // void promise
        () => {}, // ignore errors
      )
      .finally(() => {
        // Note: we might end up with an error here
        subscription.unsubscribe()
      })
  }

  return {
    end,
    endWithBeacon,
    // Note: flush may fail
    flush,
    logger: store.logger,
  }
}
