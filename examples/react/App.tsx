import {useState} from 'react'
import {
  incrementButtonClickEvent,
  saveCommentTrace,
} from '@sanity/telemetry/events'
import {useTelemetry} from '@sanity/telemetry/react'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const postComment = async (comment: string) => {
  return delay(Math.random() * 3000).then(() =>
    Math.random() > 0.5 ? {ok: true} : Promise.reject(new Error('HTTP Error')),
  )
}

function App() {
  const [count, setCount] = useState(0)

  // We only interact with the api and don't care how it's set up
  const logger = useTelemetry()

  const handleButtonClick = () => {
    setCount((nextCount) => nextCount + 1)
    logger.log(incrementButtonClickEvent, {count: count + 1})
  }
  const handlePostComment = async () => {
    const result = await logger
      .trace(saveCommentTrace)
      .wrapPromise(postComment('some comment'))

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

export default App
