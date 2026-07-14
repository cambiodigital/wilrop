import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';

export async function GET(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  try {
    const realCount = await db.transportProvider.count({
      where: { isTemplate: false },
    });

    const providers = await db.transportProvider.findMany({
      where: {
        isTemplate: realCount > 0 ? false : true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: providers });
  } catch (error: any) {
    console.error('Error fetching transport providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await request.json();

    const {
      name,
      legalName,
      nit,
      phone,
      email,
      vehicleType,
      capacity,
      active,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const provider = await db.transportProvider.create({
      data: {
        name,
        legalName: legalName ?? '',
        nit: nit ?? '',
        phone: phone ?? '',
        email: email ?? '',
        vehicleType: vehicleType ?? 'auto',
        capacity: capacity ?? 4,
        active: active ?? true,
        isTemplate: false,
      },
    });

    return NextResponse.json(
      { success: true, data: provider },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating transport provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transport provider' },
      { status: 500 }
    );
  }
}
