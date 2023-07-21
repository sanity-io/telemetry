import {useState} from 'react'
import {
  incrementButtonClickEvent,
  KnownTelemetryTrace,
  saveCommentTrace,
  TelemetryLogger,
} from '@sanity/telemetry/events'
import {useTelemetry} from '@sanity/telemetry/react'
import {z, ZodType} from 'zod'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const postComment = async (comment: string) => {
  return delay(Math.random() * 3000).then(() =>
    Math.random() > 0.5 ? {ok: true} : Promise.reject(new Error('HTTP Error')),
  )
}

/** Convenience wrapper for tracing an async execution  */
function withTrace<Schema extends ZodType>(
  logger: TelemetryLogger,
  traceEvent: KnownTelemetryTrace<Schema>,
  promise: Promise<z.infer<Schema>>,
): Promise<z.infer<Schema>> {
  const tr = logger.trace(traceEvent)
  tr.start()
  return promise.then(
    (result) => {
      tr.log(result)
      tr.complete()
      return result
    },
    (error) => {
      tr.error(error)
    },
  )
}
function Studio() {
  const [count, setCount] = useState(0)

  // We only interact with the api and don't care how it's set up
  const logger = useTelemetry()

  const handleButtonClick = () => {
    setCount((nextCount) => nextCount + 1)
    logger.log(incrementButtonClickEvent, {count: count + 1})
  }
  const handlePostComment = async () => {
    const result = await withTrace(
      logger,
      saveCommentTrace,
      postComment('some comment'),
    )

    console.log('Comment "saved"!', result)
  }
  return (
    <div style={{padding: 20}}>
      <div>
        <button onClick={handleButtonClick}>Increment!</button>
        (count is: {count})
      </div>
      <div>
        <div>
          <textarea></textarea>
        </div>
        <button onClick={handlePostComment}>Post comment</button>
      </div>
    </div>
  )
}

export default Studio
