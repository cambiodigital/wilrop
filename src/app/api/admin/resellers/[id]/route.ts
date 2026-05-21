import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword } from '@/lib/password.mjs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subagent = await db.subagent.findUnique({
      where: { id, type: 'reseller' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!subagent) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 }
      );
    }

    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error fetching reseller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reseller' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.subagent.findUnique({ where: { id, type: 'reseller' } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 }
      );
    }

    if (body.code && body.code !== existing.code) {
      const existingByCode = await db.subagent.findUnique({ where: { code: body.code } });
      if (existingByCode) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un revendedor con este código' },
          { status: 409 }
        );
      }
    }

    const normalizedEmail =
      typeof body.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : undefined;

    if (normalizedEmail && normalizedEmail !== existing.email) {
      const existingByEmail = await db.subagent.findUnique({ where: { email: normalizedEmail } });
      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un revendedor con este email' },
          { status: 409 }
        );
      }
    }

    const updates: Record<string, unknown> = {};

    if (body.code !== undefined) updates.code = body.code;
    if (normalizedEmail !== undefined) updates.email = normalizedEmail;
    if (body.password !== undefined) updates.password = await hashPassword(String(body.password));
    if (body.agencyName !== undefined) updates.agencyName = body.agencyName;
    if (body.contactName !== undefined) updates.contactName = body.contactName;
    if (body.country !== undefined) updates.country = body.country;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.commission !== undefined) updates.commission = body.commission;
    if (body.sellerLevel !== undefined) updates.sellerLevel = normalizeResellerLevel(body.sellerLevel);
    if (body.whiteLabelEnabled !== undefined) updates.whiteLabelEnabled = Boolean(body.whiteLabelEnabled);
    if (body.active !== undefined) updates.active = body.active;

    const subagent = await db.subagent.update({
      where: { id },
      data: updates,
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error updating reseller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reseller' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.subagent.findUnique({ where: { id, type: 'reseller' } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Revendedor no encontrado' },
        { status: 404 }
      );
    }

    await db.subagent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reseller:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reseller' },
      { status: 500 }
    );
  }
}
