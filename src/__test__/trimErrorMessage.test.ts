import {expect, test, vi} from 'vitest'
import {trimErrorMessage} from '../utils/trimErrorMessage'

test('Logging an example event', async () => {
  expect(trimErrorMessage('Error: this is a short one')).toBe(
    'Error: this is a short one',
  )
  expect(
    trimErrorMessage('Error: this is a short one\nwith newlines in it'),
  ).toMatchInlineSnapshot('"Error: this is a short one… (+20)"')
  expect(
    trimErrorMessage(
      'Error: this is a long one without any newlines or anything, quite long yes, it is a pretty long message indeed.',
    ),
  ).toMatchInlineSnapshot(
    '"Error: this is a long one without any newlines or anything, quite long yes, it is a pretty long mess… (+11)"',
  )

  expect(
    trimErrorMessage(
      'Error: this is a long one without any newlines or anything, quite long yes, it is a pretty long message indeed.\nand it also has newlines in it',
    ),
  ).toMatchInlineSnapshot(
    '"Error: this is a long one without any newlines or anything, quite long yes, it is a pretty long mess… (+42)"',
  )
})
