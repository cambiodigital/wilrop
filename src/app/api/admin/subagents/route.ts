import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const subagents = await db.subagent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    // Remove password from response
    const sanitized = subagents.map(({ password: _pwd, ...rest }) => rest);

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error fetching subagents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subagents' },
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
      active,
    } = body;

    if (!code || !email || !password || !agencyName || !contactName) {
      return NextResponse.json(
        { success: false, error: 'code, email, password, agencyName, and contactName are required' },
        { status: 400 }
      );
    }

    // Check if code or email already exists
    const existingByCode = await db.subagent.findUnique({ where: { code } });
    if (existingByCode) {
      return NextResponse.json(
        { success: false, error: 'A subagent with this code already exists' },
        { status: 409 }
      );
    }

    const existingByEmail = await db.subagent.findUnique({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'A subagent with this email already exists' },
        { status: 409 }
      );
    }

    const subagent = await db.subagent.create({
      data: {
        code,
        email,
        password,
        agencyName,
        contactName,
        country: country ?? '',
        phone: phone ?? '',
        commission: commission ?? 15,
        active: active ?? true,
      },
    });

    // Remove password from response
    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json(
      { success: true, data: sanitized },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subagent' },
      { status: 500 }
    );
  }
}
