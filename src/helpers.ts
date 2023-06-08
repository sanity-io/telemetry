import { TelemetryTrace } from "./types.ts"
import { z, ZodType } from "zod"

/**
 * Promise wrapper that logs the result of the promise to the trace
 * @param trace
 * @param promise
 */
export function fromPromise<Schema extends ZodType>(
  trace: TelemetryTrace<Schema>,
  promise: Promise<z.infer<ZodType>>
) {
  trace.start()
  return promise.then(
    (result) => {
      trace.log(result)
      trace.complete()
      return result
    },
    (error) => {
      trace.error(error)
    }
  )
}
