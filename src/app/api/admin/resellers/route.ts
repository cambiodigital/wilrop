import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword } from '@/lib/password.mjs';

export async function GET() {
  try {
    const resellers = await db.reseller.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { catalogs: true, clients: true, sales: true },
        },
      },
    });

    const sanitized = resellers.map(({ password: _pwd, ...rest }) => rest);

    return NextResponse.json({ success: true, data: sanitized });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resellers' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code, email, password, companyName, contactName,
      country, phone, website, taxId, address,
      commission, sellerLevel, whiteLabelEnabled, active,
    } = body;

    if (!code || !email || !password || !companyName || !contactName) {
      return NextResponse.json(
        { success: false, error: 'code, email, password, companyName, and contactName are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const hashedPassword = await hashPassword(String(password));

    const existingByCode = await db.reseller.findUnique({ where: { code } });
    if (existingByCode) {
      return NextResponse.json(
        { success: false, error: 'A reseller with this code already exists' },
        { status: 409 },
      );
    }

    const existingByEmail = await db.reseller.findUnique({ where: { email: normalizedEmail } });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'A reseller with this email already exists' },
        { status: 409 },
      );
    }

    const reseller = await db.reseller.create({
      data: {
        code,
        email: normalizedEmail,
        password: hashedPassword,
        companyName,
        contactName,
        country: country ?? '',
        phone: phone ?? '',
        website: website ?? '',
        taxId: taxId ?? '',
        address: address ?? '',
        commission: commission ?? 10,
        sellerLevel: normalizeResellerLevel(sellerLevel),
        whiteLabelEnabled: Boolean(whiteLabelEnabled),
        active: active ?? true,
        approvalStatus: 'approved',
      },
    });

    const { password: _pwd, ...sanitized } = reseller;

    return NextResponse.json(
      { success: true, data: sanitized },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create reseller' },
      { status: 500 },
    );
  }
}
