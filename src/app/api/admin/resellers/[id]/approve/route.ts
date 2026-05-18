import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPanelSessionToken, getPanelSessionCookieName } from '@/lib/panel-auth';

async function isAdmin(request: NextRequest): Promise<string | null> {
  const cookieName = getPanelSessionCookieName('admin');
  const sessionToken = request.cookies.get(cookieName)?.value;
  const session = verifyPanelSessionToken(sessionToken, 'admin');
  return session ? session.id : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await isAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    const reseller = await db.reseller.findUnique({ where: { id } });

    if (!reseller) {
      return NextResponse.json({ error: 'Revendedor no encontrado' }, { status: 404 });
    }

    if (action === 'approve') {
      await db.reseller.update({
        where: { id },
        data: {
          active: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId,
          rejectionReason: '',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Revendedor "${reseller.companyName}" aprobado y activado`,
      });
    }

    if (action === 'reject') {
      const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

      await db.reseller.update({
        where: { id },
        data: {
          active: false,
          approvalStatus: 'rejected',
          rejectionReason: reason || 'No se especificó un motivo',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Solicitud de "${reseller.companyName}" rechazada`,
      });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
