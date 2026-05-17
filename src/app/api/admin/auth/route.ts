import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encodeAdminSession, getAdminSessionCookie } from '@/lib/admin-auth';
import { hashPassword, shouldUpgradePasswordHash, verifyPassword } from '@/lib/password.mjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    console.log('[AdminAuth] Request body received:', { emailProvided: !!body.email, email, passwordProvided: !!body.password });

    if (!email || !password) {
      console.log('[AdminAuth] Missing credentials - email:', !!email, 'password:', !!password);
      return NextResponse.json(
        { success: false, error: 'Email y contrasena son obligatorios' },
        { status: 400 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { email },
    });

    console.log('[AdminAuth] DB lookup - admin found:', !!admin, 'for email:', email);

    if (!admin) {
      console.log('[AdminAuth] No admin found for email:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(admin.password, password);
    console.log('[AdminAuth] Password valid:', passwordValid);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (shouldUpgradePasswordHash(admin.password)) {
      try {
        const upgradedHash = await hashPassword(password);
        await db.admin.update({
          where: { id: admin.id },
          data: { password: upgradedHash },
        });
      } catch {}
    }

    console.log('[AdminAuth] Login success - creating session for:', admin.name);

    const sessionValue = encodeAdminSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(getAdminSessionCookie(sessionValue));
    return response;
  } catch (error: any) {
    console.error('[AdminAuth] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
