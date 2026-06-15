/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require('node:assert/strict')
const test = require('node:test')
const ts = require('typescript')

require.extensions['.ts'] = function loadTypeScript(module, filename) {
  const source = require('node:fs').readFileSync(filename, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText

  module._compile(output, filename)
}

const { MIN_PASSWORD_LENGTH } = require('../src/lib/constants.ts')

// ---------------------------------------------------------------------------
// Shared constant verification
// ---------------------------------------------------------------------------

test('MIN_PASSWORD_LENGTH is defined and equals 8', () => {
  assert.equal(MIN_PASSWORD_LENGTH, 8)
})

// ---------------------------------------------------------------------------
// Registration API password validation — mirrors the logic in
// src/app/api/reseller/register/route.ts lines 28-33
// ---------------------------------------------------------------------------

/**
 * Simulates the password-length check from the registration API.
 * Returns { ok: true } if the password passes, or { ok: false, error: string }.
 */
function checkPasswordLength(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La contrase\u00f1a debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    }
  }
  return { ok: true }
}

test('rejects password shorter than MIN_PASSWORD_LENGTH', () => {
  const shortPassword = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)
  const result = checkPasswordLength(shortPassword)

  assert.equal(result.ok, false)
  assert.match(result.error, new RegExp(`${MIN_PASSWORD_LENGTH}`))
})

test('accepts password at exactly MIN_PASSWORD_LENGTH', () => {
  const exactPassword = 'a'.repeat(MIN_PASSWORD_LENGTH)
  const result = checkPasswordLength(exactPassword)

  assert.equal(result.ok, true)
})

test('accepts password longer than MIN_PASSWORD_LENGTH', () => {
  const longPassword = 'a'.repeat(MIN_PASSWORD_LENGTH + 10)
  const result = checkPasswordLength(longPassword)

  assert.equal(result.ok, true)
})

test('error message references the shared constant value', () => {
  const shortPassword = 'abc'
  const result = checkPasswordLength(shortPassword)

  assert.equal(result.ok, false)
  assert.ok(
    result.error.includes(String(MIN_PASSWORD_LENGTH)),
    `Error message should contain "${MIN_PASSWORD_LENGTH}" but got: "${result.error}"`,
  )
})

test('rejects empty password', () => {
  const result = checkPasswordLength('')

  assert.equal(result.ok, false)
})
