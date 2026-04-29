import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPanelSessionToken, getPanelSessionCookie, secureCompare } from '@/lib/panel-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const subagent = await db.subagent.findUnique({
      where: { email },
    });

    if (!subagent) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!secureCompare(subagent.password, password)) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!subagent.active) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    const sessionToken = createPanelSessionToken({
      id: subagent.id,
      email: subagent.email,
      name: subagent.contactName || subagent.agencyName,
      panelRole: 'subagent',
      appRole: 'subagent',
      code: subagent.code,
      commission: subagent.commission,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: subagent.id,
        code: subagent.code,
        email: subagent.email,
        agencyName: subagent.agencyName,
        contactName: subagent.contactName,
        country: subagent.country,
        phone: subagent.phone,
        commission: subagent.commission,
        active: subagent.active,
      },
    });

    response.cookies.set(getPanelSessionCookie('subagent', sessionToken));
    return response;
  } catch (error: unknown) {
    console.error('Error authenticating subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
