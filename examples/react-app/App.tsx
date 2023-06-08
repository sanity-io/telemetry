import { useState } from "react"
import "./App.css"
import {
  incrementButtonClickEvent,
  postCommentTraceEvent,
} from "@sanity/telemetry"
import { useTelemetry } from "@sanity/telemetry/react"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const postComment = async (comment: string) => {
  return delay(Math.random() * 3000).then(() =>
    Math.random() > 0.5 ? { ok: true } : Promise.reject(new Error("HTTP Error"))
  )
}

function App() {
  const [count, setCount] = useState(0)

  // We only interact with the api and don't care how it's set up
  const telemetry = useTelemetry()

  const handleButtonClick = () => {
    setCount((count) => count + 1)
    telemetry.log(incrementButtonClickEvent, { count: count + 1 })
  }
  const handlePostComment = async () => {
    const result = await telemetry.tracePromise(
      postCommentTraceEvent,
      postComment("some comment")
    )

    return setCount((count) => count + 1)
  }
  return (
    <>
      <div>
        <textarea></textarea>
        <button onClick={handlePostComment}>Post comment</button>
        <button onClick={handleButtonClick}>count is: {count}</button>
      </div>
    </>
  )
}

export default App
