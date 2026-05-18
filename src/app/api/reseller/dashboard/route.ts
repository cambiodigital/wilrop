import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getDashboardData } from '@/lib/reseller/dashboard'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const data = await getDashboardData(session.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[ResellerDashboard] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los datos del dashboard' },
      { status: 500 },
    )
  }
}
