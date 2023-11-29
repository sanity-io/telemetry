import {useState} from 'react'

import {useTelemetry} from '@sanity/telemetry/react'
import {
  ExampleIncrementButtonClick,
  ExampleSaveComment,
} from './studio.telemetry'

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
    logger.log(ExampleIncrementButtonClick, {count: count + 1})
  }
  const handlePostComment = async () => {
    const result = await logger
      .trace(ExampleSaveComment)
      .await(postComment('some comment'))

    // eslint-disable-next-line no-console
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
