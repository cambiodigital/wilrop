import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const checks: Record<string, string> = {}
  let healthy = true

  // Database connectivity
  try {
    await db.$queryRaw`SELECT 1`
    checks.db = 'ok'
  } catch {
    checks.db = 'fail'
    healthy = false
  }

  const status = healthy ? 200 : 503

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? 'unknown',
    },
    { status },
  )
}
