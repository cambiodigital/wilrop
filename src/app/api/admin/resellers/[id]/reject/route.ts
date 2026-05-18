import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPanelSessionToken, getPanelSessionCookieName } from '@/lib/panel-auth';

async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookieName = getPanelSessionCookieName('admin');
  const sessionToken = request.cookies.get(cookieName)?.value;
  const session = verifyPanelSessionToken(sessionToken, 'admin');
  return !!session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'El motivo de rechazo es obligatorio' }, { status: 400 });
    }

    const reseller = await db.reseller.findUnique({ where: { id } });

    if (!reseller) {
      return NextResponse.json({ error: 'Revendedor no encontrado' }, { status: 404 });
    }

    await db.reseller.update({
      where: { id },
      data: {
        active: false,
        approvalStatus: 'rejected',
        rejectionReason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Solicitud de "${reseller.companyName}" rechazada`,
    });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
