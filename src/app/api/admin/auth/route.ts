import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encodeAdminSession, getAdminSessionCookie } from '@/lib/admin-auth';
import { hashPassword, shouldUpgradePasswordHash, verifyPassword } from '@/lib/password.mjs';
import { loginSchema } from '@/lib/validators/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, remaining } = checkRateLimit(`admin-auth:${ip}`, 5, 15 * 60 * 1000);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Intenta más tarde.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const admin = await db.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(admin.password, password);

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
  } catch (error) {
    console.error('[AdminAuth] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
