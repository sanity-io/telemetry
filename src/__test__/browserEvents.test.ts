import {afterEach, expect, test, vi} from 'vitest'
import {onPageHide} from '../utils/browserEvents'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('Browsers without pagehide use beforeunload and unload, with cleanup', () => {
  const target = new EventTarget()
  vi.stubGlobal('window', target)
  const listener = vi.fn()
  const cleanup = onPageHide(listener)

  target.dispatchEvent(new Event('beforeunload'))
  expect(listener).toHaveBeenCalledTimes(1)
  target.dispatchEvent(new Event('unload'))
  expect(listener).toHaveBeenCalledTimes(2)

  cleanup()
  target.dispatchEvent(new Event('beforeunload'))
  target.dispatchEvent(new Event('unload'))
  expect(listener).toHaveBeenCalledTimes(2)
})

test('Browsers with pagehide avoid unload fallbacks and clean up pagehide', () => {
  const target = Object.assign(new EventTarget(), {onpagehide: null})
  vi.stubGlobal('window', target)
  const listener = vi.fn()
  const cleanup = onPageHide(listener)

  target.dispatchEvent(new Event('beforeunload'))
  target.dispatchEvent(new Event('unload'))
  expect(listener).not.toHaveBeenCalled()
  target.dispatchEvent(new Event('pagehide'))
  expect(listener).toHaveBeenCalledTimes(1)

  cleanup()
  target.dispatchEvent(new Event('pagehide'))
  expect(listener).toHaveBeenCalledTimes(1)
})
