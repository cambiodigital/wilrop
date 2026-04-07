import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    if (subagent.password !== password) {
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

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Error authenticating subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
