'use strict'

/** @type import('eslint').Linter.Config */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  rules: {
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}
