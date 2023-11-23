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
    const timeout = setTimeout(() => {
      subscriber.next()
      subscriber.complete()
    }, ms)
    if (typeof timeout.unref === 'function') {
      // unref the timeout to avoid holding the process open in node.js
      timeout.unref()
    }
    return () => clearTimeout(timeout)
  })

/**
 * 'unknown' - we don't know if the user has consented or not (e.g. something went wrong)
 * 'unset' - the user has not yet been asked for consent
 * 'granted' - the user has consented
 * 'denied' - the user has denied consent
 */
export type ConsentStatus = 'undetermined' | 'unset' | 'granted' | 'denied'

export interface CreateBatchedStoreOptions {
  /**
   * Optionally provide a flush interval
   */
  flushInterval?: number

  /**
   *  Provide a strategy for resolving consent depending on context (e.g. studio/cli)
   *  @public
   */
  resolveConsent: () => Promise<{status: ConsentStatus}>
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

  function resolveConsent(): Promise<{status: ConsentStatus}> {
    return options.resolveConsent().catch((err) =>
      // if we for some reason can't fetch consent we treat it as "undetermined", and try again at next flush
      ({status: 'undetermined' as const}),
    )
  }

  const _buffer: TelemetryEvent[] = []

  function consume() {
    const buf = _buffer.slice()
    _buffer.length = 0
    return buf
  }

  function submit() {
    if (_buffer.length === 0) {
      return EMPTY
    }
    return from(resolveConsent()).pipe(
      mergeMap((consent) => {
        if (consent.status === 'denied') {
          // consent is denied, so we just clear the buffer
          consume()
          return EMPTY
        }
        if (consent.status !== 'granted') {
          return EMPTY
        }
        // consent is granted
        const events = consume()
        return from(options.sendEvents(events)).pipe(
          catchError((err) => {
            // In case of error, put events back on the buffer
            _buffer.unshift(...events)
            // and ignore the error
            return EMPTY
          }),
        )
      }),
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
    concatMap(() => submit()),
  )

  function flush() {
    return lastValueFrom(submit(), {
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
