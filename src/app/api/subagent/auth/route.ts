import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPanelSessionToken, getPanelSessionCookie } from '@/lib/panel-auth';
import { getResellerCapabilities, normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword, shouldUpgradePasswordHash, verifyPassword } from '@/lib/password.mjs';
import { loginSchema } from '@/lib/validators/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, remaining } = checkRateLimit(`subagent-auth:${ip}`, 5, 15 * 60 * 1000);

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

    const subagent = await db.subagent.findUnique({
      where: { email },
    });

    if (!subagent) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(subagent.password, password);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (shouldUpgradePasswordHash(subagent.password)) {
      try {
        const upgradedHash = await hashPassword(password);
        await db.subagent.update({
          where: { id: subagent.id },
          data: { password: upgradedHash },
        });
      } catch {}
    }

    if (!subagent.active) {
      return NextResponse.json(
        { success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    const sellerLevel = normalizeResellerLevel(subagent.sellerLevel);
    const capabilities = getResellerCapabilities({
      sellerLevel,
      whiteLabelEnabled: subagent.whiteLabelEnabled,
    });

    const sessionToken = createPanelSessionToken({
      id: subagent.id,
      email: subagent.email,
      name: subagent.contactName || subagent.agencyName,
      panelRole: 'subagent',
      appRole: sellerLevel,
      code: subagent.code,
      commission: subagent.commission,
      whiteLabelEnabled: capabilities.canUseWhiteLabel,
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
        sellerLevel,
        whiteLabelEnabled: capabilities.canUseWhiteLabel,
        active: subagent.active,
      },
    });

    response.cookies.set(getPanelSessionCookie('subagent', sessionToken));
    return response;
  } catch (error) {
    console.error('[SubagentAuth] Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
