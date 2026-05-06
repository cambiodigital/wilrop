import bcrypt from 'bcryptjs'
import { secureCompare } from './secure-compare.mjs'

function getHashRounds() {
  const raw = Number.parseInt(String(process.env.WILROP_PASSWORD_HASH_ROUNDS ?? ''), 10)
  if (Number.isFinite(raw) && raw >= 10 && raw <= 15) {
    return raw
  }
  return 12
}

export function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value)
}

function bcryptHash(plain, rounds) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(plain, rounds, (err, hashed) => {
      if (err) reject(err)
      else resolve(hashed)
    })
  })
}

function bcryptCompare(plain, hashed) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plain, hashed, (err, same) => {
      if (err) reject(err)
      else resolve(Boolean(same))
    })
  })
}

export async function hashPassword(plain) {
  const normalized = typeof plain === 'string' ? plain : String(plain ?? '')
  return bcryptHash(normalized, getHashRounds())
}

export async function verifyPassword(stored, provided) {
  const storedValue = typeof stored === 'string' ? stored : String(stored ?? '')
  const providedValue = typeof provided === 'string' ? provided : String(provided ?? '')

  if (isBcryptHash(storedValue)) {
    return bcryptCompare(providedValue, storedValue)
  }

  return secureCompare(storedValue, providedValue)
}

export function shouldUpgradePasswordHash(stored) {
  return !isBcryptHash(stored)
}
