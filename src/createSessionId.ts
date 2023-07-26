import {typeid} from 'typeid-ts'

/**
 * @public
 */
export type SessionId = string & {__type: 'SessionId'}

export function createSessionId(): SessionId {
  return typeid('session') as SessionId
}
