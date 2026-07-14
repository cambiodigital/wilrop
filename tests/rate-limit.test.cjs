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
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
    fileName: filename,
  }).outputText
  module._compile(output, filename)
}

const { checkRateLimit } = require('../src/lib/rate-limit.ts')

// ─── Rate Limiter Tests ────────────────────────────────────────────

test('rate-limit: allows first request', () => {
  const result = checkRateLimit('test-allow-1', 5, 60000)
  assert.equal(result.allowed, true)
  assert.equal(result.remaining, 4)
})

test('rate-limit: allows requests up to max', () => {
  const key = 'test-max-' + Date.now()
  for (let i = 0; i < 5; i++) {
    const r = checkRateLimit(key, 5, 60000)
    assert.equal(r.allowed, true, `Request ${i + 1} should be allowed`)
  }
})

test('rate-limit: blocks after max exceeded', () => {
  const key = 'test-block-' + Date.now()
  for (let i = 0; i < 5; i++) {
    checkRateLimit(key, 5, 60000)
  }
  const result = checkRateLimit(key, 5, 60000)
  assert.equal(result.allowed, false)
  assert.equal(result.remaining, 0)
})

test('rate-limit: resets after window expires', () => {
  const key = 'test-reset-' + Date.now()
  // Exhaust the limit
  for (let i = 0; i < 5; i++) {
    checkRateLimit(key, 5, 1) // 1ms window
  }
  // Wait for window to expire
  const start = Date.now()
  while (Date.now() - start < 5) { /* spin */ }
  const result = checkRateLimit(key, 5, 60000)
  assert.equal(result.allowed, true)
})

test('rate-limit: different keys are independent', () => {
  const keyA = 'test-independent-a-' + Date.now()
  const keyB = 'test-independent-b-' + Date.now()
  for (let i = 0; i < 5; i++) {
    checkRateLimit(keyA, 5, 60000)
  }
  const resultA = checkRateLimit(keyA, 5, 60000)
  const resultB = checkRateLimit(keyB, 5, 60000)
  assert.equal(resultA.allowed, false)
  assert.equal(resultB.allowed, true)
})

test('rate-limit: remaining decrements correctly', () => {
  const key = 'test-remaining-' + Date.now()
  const r1 = checkRateLimit(key, 3, 60000)
  assert.equal(r1.remaining, 2)
  const r2 = checkRateLimit(key, 3, 60000)
  assert.equal(r2.remaining, 1)
  const r3 = checkRateLimit(key, 3, 60000)
  assert.equal(r3.remaining, 0)
  const r4 = checkRateLimit(key, 3, 60000)
  assert.equal(r4.remaining, 0)
  assert.equal(r4.allowed, false)
})
