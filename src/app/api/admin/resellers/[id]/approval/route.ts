import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPanelSessionToken, getPanelSessionCookieName } from '@/lib/panel-auth'
import { cookies } from 'next/headers'

async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookieName = getPanelSessionCookieName('admin')
  const sessionToken = request.cookies.get(cookieName)?.value
  const session = verifyPanelSessionToken(sessionToken, 'admin')
  return !!session
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const subagent = await db.subagent.findUnique({ where: { id, type: 'reseller' } })

    if (!subagent) {
      return NextResponse.json({ error: 'Revendedor no encontrado' }, { status: 404 })
    }

    const approvalStatus = (subagent as Record<string, unknown>).approvalStatus as string | undefined

    if (approvalStatus === undefined) {
      return NextResponse.json(
        { error: 'Este revendedor no usa el sistema de aprobación' },
        { status: 400 },
      )
    }

    if (action === 'approve') {
      await db.subagent.update({
        where: { id },
        data: {
          active: true,
          approvalStatus: 'approved',
        },
      })

      return NextResponse.json({
        success: true,
        message: `Revendedor "${subagent.agencyName}" aprobado y activado`,
      })
    }

    if (action === 'reject') {
      await db.subagent.update({
        where: { id },
        data: {
          active: false,
          approvalStatus: 'rejected',
        },
      })

      return NextResponse.json({
        success: true,
        message: `Solicitud de "${subagent.agencyName}" rechazada`,
      })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error) {
    console.error('[AdminResellerApproval] Error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
