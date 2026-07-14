interface RateLimitRecord {
  count: number
  resetAt: number
}

const attempts = new Map<string, RateLimitRecord>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count }
}

// Cleanup expired entries every 60s
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of attempts) {
      if (now > record.resetAt) attempts.delete(key)
    }
  }, 60_000)
}
