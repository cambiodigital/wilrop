import { NextResponse } from 'next/server'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getSubagentDashboardData } from '@/lib/subagent/dashboard'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('subagent'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'subagent')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const data = await getSubagentDashboardData(session.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[SubagentDashboard] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los datos del dashboard' },
      { status: 500 },
    )
  }
}
