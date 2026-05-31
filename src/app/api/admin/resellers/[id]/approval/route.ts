import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPanelSessionToken, getPanelSessionCookieName } from '@/lib/panel-auth'
import { cookies } from 'next/headers'

async function getAdminSession(request: NextRequest) {
  const cookieName = getPanelSessionCookieName('admin')
  const sessionToken = request.cookies.get(cookieName)?.value
  return verifyPanelSessionToken(sessionToken, 'admin')
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const adminSession = await getAdminSession(request)
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const reseller = await db.reseller.findUnique({ where: { id } })

    if (!reseller) {
      return NextResponse.json({ error: 'Revendedor no encontrado' }, { status: 404 })
    }

    if (action === 'approve') {
      await db.reseller.update({
        where: { id },
        data: {
          active: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: adminSession.id,
          rejectionReason: '',
        },
      })

      return NextResponse.json({
        success: true,
        message: `Revendedor "${reseller.companyName}" aprobado y activado`,
      })
    }

    if (action === 'reject') {
      await db.reseller.update({
        where: { id },
        data: {
          active: false,
          approvalStatus: 'rejected',
          rejectionReason: reason || 'No se especificó un motivo',
        },
      })

      return NextResponse.json({
        success: true,
        message: `Solicitud de "${reseller.companyName}" rechazada`,
      })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error) {
    console.error('[AdminResellerApproval] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
