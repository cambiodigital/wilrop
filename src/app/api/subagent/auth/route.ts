import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createPanelSessionToken, getPanelSessionCookie } from '@/lib/panel-auth';
import { getResellerCapabilities, normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword, shouldUpgradePasswordHash, verifyPassword } from '@/lib/password.mjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    console.log('[SubagentAuth] Request body received:', { emailProvided: !!body.email, email, passwordProvided: !!body.password });

    if (!email || !password) {
      console.log('[SubagentAuth] Missing credentials - email:', !!email, 'password:', !!password);
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const subagent = await db.subagent.findUnique({
      where: { email },
    });

    console.log('[SubagentAuth] DB lookup - subagent found:', !!subagent, 'for email:', email);

    if (!subagent) {
      console.log('[SubagentAuth] No subagent found for email:', email);
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(subagent.password, password);
    console.log('[SubagentAuth] Password valid:', passwordValid);

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
      console.log('[SubagentAuth] Subagent inactive:', email);
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

    console.log('[SubagentAuth] Login success - creating session for:', subagent.contactName || subagent.agencyName);

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
  } catch (error: any) {
    console.error('[SubagentAuth] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
