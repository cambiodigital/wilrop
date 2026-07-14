/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const test = require('node:test')

// password.mjs is ESM, so we use dynamic import via --experimental-require-module
// For now, test the synchronous helpers directly

// ─── isBcryptHash (inline copy for testing pattern) ────────────────
function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

test('isBcryptHash: recognizes bcrypt $2a$', () => {
  assert.equal(isBcryptHash('$2a$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ'), true)
})

test('isBcryptHash: recognizes bcrypt $2b$', () => {
  assert.equal(isBcryptHash('$2b$10$somehashvalue'), true)
})

test('isBcryptHash: recognizes bcrypt $2y$', () => {
  assert.equal(isBcryptHash('$2y$12$somehashvalue'), true)
})

test('isBcryptHash: rejects plain text', () => {
  assert.equal(isBcryptHash('mypassword'), false)
})

test('isBcryptHash: rejects empty string', () => {
  assert.equal(isBcryptHash(''), false)
})

test('isBcryptHash: rejects non-string', () => {
  assert.equal(isBcryptHash(null), false)
  assert.equal(isBcryptHash(undefined), false)
  assert.equal(isBcryptHash(123), false)
})

test('isBcryptHash: rejects partial match', () => {
  assert.equal(isBcryptHash('$2a$toolong'), false)
  assert.equal(isBcryptHash('prefix$2a$12$suffix'), false)
})

// ─── shouldUpgradePasswordHash pattern ─────────────────────────────
function shouldUpgradePasswordHash(stored) {
  return !isBcryptHash(stored)
}

test('shouldUpgrade: plain text needs upgrade', () => {
  assert.equal(shouldUpgradePasswordHash('mypassword'), true)
})

test('shouldUpgrade: bcrypt hash does not need upgrade', () => {
  assert.equal(shouldUpgradePasswordHash('$2a$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ'), false)
})

// ─── Hash rounds config ────────────────────────────────────────────
function getHashRounds() {
  const raw = Number.parseInt(String(process.env.WILROP_PASSWORD_HASH_ROUNDS ?? ''), 10)
  if (Number.isFinite(raw) && raw >= 10 && raw <= 15) {
    return raw
  }
  return 12
}

test('hashRounds: defaults to 12', () => {
  const original = process.env.WILROP_PASSWORD_HASH_ROUNDS
  delete process.env.WILROP_PASSWORD_HASH_ROUNDS
  assert.equal(getHashRounds(), 12)
  if (original) process.env.WILROP_PASSWORD_HASH_ROUNDS = original
})

test('hashRounds: respects valid env value', () => {
  const original = process.env.WILROP_PASSWORD_HASH_ROUNDS
  process.env.WILROP_PASSWORD_HASH_ROUNDS = '10'
  assert.equal(getHashRounds(), 10)
  if (original) process.env.WILROP_PASSWORD_HASH_ROUNDS = original
  else delete process.env.WILROP_PASSWORD_HASH_ROUNDS
})

test('hashRounds: rejects out-of-range value', () => {
  const original = process.env.WILROP_PASSWORD_HASH_ROUNDS
  process.env.WILROP_PASSWORD_HASH_ROUNDS = '5'
  assert.equal(getHashRounds(), 12)
  if (original) process.env.WILROP_PASSWORD_HASH_ROUNDS = original
  else delete process.env.WILROP_PASSWORD_HASH_ROUNDS
})

test('hashRounds: rejects value above 15', () => {
  const original = process.env.WILROP_PASSWORD_HASH_ROUNDS
  process.env.WILROP_PASSWORD_HASH_ROUNDS = '20'
  assert.equal(getHashRounds(), 12)
  if (original) process.env.WILROP_PASSWORD_HASH_ROUNDS = original
  else delete process.env.WILROP_PASSWORD_HASH_ROUNDS
})
