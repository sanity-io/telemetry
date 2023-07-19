import {_defineLogEvent} from '../../internal.ts'

export const corsOriginAddedEvent = _defineLogEvent({
  name: 'corsOriginAddedEvent',
  displayName: 'Cors origin added',
  description: 'Cors origin added to project',
  version: 1,
})
