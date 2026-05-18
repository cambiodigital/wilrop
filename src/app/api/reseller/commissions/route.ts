import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { getCommissionData } from '@/lib/reseller/commissions'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const data = await getCommissionData(session.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[ResellerCommissions] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los datos de comisiones' },
      { status: 500 },
    )
  }
}
