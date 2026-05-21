import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword } from '@/lib/password.mjs';

export async function GET() {
  try {
    const subagents = await db.subagent.findMany({
      where: { type: 'reseller' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const sanitized = subagents.map(({ password: _pwd, ...rest }) => rest);

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error fetching resellers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resellers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      code,
      email,
      password,
      agencyName,
      contactName,
      country,
      phone,
      commission,
      sellerLevel,
      whiteLabelEnabled,
      active,
    } = body;

    if (!code || !email || !password || !agencyName || !contactName) {
      return NextResponse.json(
        { success: false, error: 'code, email, password, agencyName, and contactName are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const hashedPassword = await hashPassword(String(password));

    const existingByCode = await db.subagent.findUnique({ where: { code } });
    if (existingByCode) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un revendedor con este código' },
        { status: 409 }
      );
    }

    const existingByEmail = await db.subagent.findUnique({ where: { email: normalizedEmail } });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un revendedor con este email' },
        { status: 409 }
      );
    }

    const subagent = await db.subagent.create({
      data: {
        code,
        email: normalizedEmail,
        password: hashedPassword,
        agencyName,
        contactName,
        country: country ?? '',
        phone: phone ?? '',
        commission: commission ?? 15,
        sellerLevel: normalizeResellerLevel(sellerLevel),
        type: 'reseller',
        whiteLabelEnabled: Boolean(whiteLabelEnabled),
        active: active ?? true,
        approvalStatus: 'approved',
      },
    });

    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json(
      { success: true, data: sanitized },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating reseller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reseller' },
      { status: 500 }
    );
  }
}
