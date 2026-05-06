import { createHash, timingSafeEqual } from 'node:crypto'

export function secureCompare(left, right) {
  const leftHash = createHash('sha256').update(String(left ?? ''), 'utf8').digest()
  const rightHash = createHash('sha256').update(String(right ?? ''), 'utf8').digest()
  return timingSafeEqual(leftHash, rightHash)
}
