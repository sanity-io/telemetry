/**
 * @public
 */
export type SessionId = string & {__type: 'SessionId'}

export function createSessionId(): SessionId {
  return Math.random().toString(36).substr(2, 9) as SessionId
}
