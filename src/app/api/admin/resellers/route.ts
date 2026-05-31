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
          select: { bookings: true },
        },
      },
    });

    const sanitized = resellers.map(({ password: _pwd, companyName, ...rest }) => ({
      ...rest,
      agencyName: companyName, // Map companyName to agencyName for frontend compatibility
    }));

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

    const existingByCode = await db.reseller.findUnique({ where: { code } });
    if (existingByCode) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un revendedor con este código' },
        { status: 409 }
      );
    }

    const existingByEmail = await db.reseller.findUnique({ where: { email: normalizedEmail } });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un revendedor con este email' },
        { status: 409 }
      );
    }

    const reseller = await db.reseller.create({
      data: {
        code,
        email: normalizedEmail,
        password: hashedPassword,
        companyName: agencyName, // Map agencyName to companyName
        contactName,
        country: country ?? '',
        phone: phone ?? '',
        commission: commission ?? 15,
        sellerLevel: normalizeResellerLevel(sellerLevel),
        whiteLabelEnabled: Boolean(whiteLabelEnabled),
        active: active ?? true,
        approvalStatus: 'approved',
      },
    });

    const { password: _pwd, companyName, ...sanitized } = reseller;
    const responseData = {
      ...sanitized,
      agencyName: companyName, // Map back for frontend
    };

    return NextResponse.json(
      { success: true, data: responseData },
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
