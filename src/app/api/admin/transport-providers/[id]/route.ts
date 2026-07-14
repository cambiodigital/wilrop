import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/admin/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const provider = await db.transportProvider.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Transport provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: provider });
  } catch (error: any) {
    console.error('Error fetching transport provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transport provider' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.transportProvider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport provider not found' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.legalName !== undefined) updates.legalName = body.legalName;
    if (body.nit !== undefined) updates.nit = body.nit;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;
    if (body.vehicleType !== undefined) updates.vehicleType = body.vehicleType;
    if (body.capacity !== undefined) updates.capacity = body.capacity;
    if (body.active !== undefined) updates.active = body.active;

    const provider = await db.transportProvider.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ success: true, data: provider });
  } catch (error: any) {
    console.error('Error updating transport provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update transport provider' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!getAdminSession(request)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const existing = await db.transportProvider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Transport provider not found' },
        { status: 404 }
      );
    }

    await db.transportProvider.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transport provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transport provider' },
      { status: 500 }
    );
  }
}
