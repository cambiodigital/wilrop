import { NextResponse } from 'next/server'
import { clearPanelSessionCookie } from '@/lib/panel-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(clearPanelSessionCookie('reseller'))
  return response
}