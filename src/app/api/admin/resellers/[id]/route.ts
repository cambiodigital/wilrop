import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeResellerLevel } from '@/lib/reseller-access';
import { hashPassword } from '@/lib/password.mjs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const reseller = await db.reseller.findUnique({
      where: { id },
      include: {
        _count: {
          select: { catalogs: true, clients: true, sales: true, documents: true },
        },
      },
    });

    if (!reseller) {
      return NextResponse.json(
        { success: false, error: 'Reseller not found' },
        { status: 404 },
      );
    }

    const { password: _pwd, ...sanitized } = reseller;

    return NextResponse.json({ success: true, data: sanitized });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reseller' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.reseller.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reseller not found' },
        { status: 404 },
      );
    }

    if (body.code && body.code !== existing.code) {
      const existingByCode = await db.reseller.findUnique({ where: { code: body.code } });
      if (existingByCode) {
        return NextResponse.json(
          { success: false, error: 'A reseller with this code already exists' },
          { status: 409 },
        );
      }
    }

    const normalizedEmail =
      typeof body.email === 'string' && body.email.trim()
        ? body.email.trim().toLowerCase()
        : undefined;

    if (normalizedEmail && normalizedEmail !== existing.email) {
      const existingByEmail = await db.reseller.findUnique({ where: { email: normalizedEmail } });
      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'A reseller with this email already exists' },
          { status: 409 },
        );
      }
    }

    const updates: Record<string, unknown> = {};

    if (body.code !== undefined) updates.code = body.code;
    if (normalizedEmail !== undefined) updates.email = normalizedEmail;
    if (body.password !== undefined) updates.password = await hashPassword(String(body.password));
    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.contactName !== undefined) updates.contactName = body.contactName;
    if (body.country !== undefined) updates.country = body.country;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.website !== undefined) updates.website = body.website;
    if (body.taxId !== undefined) updates.taxId = body.taxId;
    if (body.address !== undefined) updates.address = body.address;
    if (body.commission !== undefined) updates.commission = body.commission;
    if (body.sellerLevel !== undefined) updates.sellerLevel = normalizeResellerLevel(body.sellerLevel);
    if (body.whiteLabelEnabled !== undefined) updates.whiteLabelEnabled = Boolean(body.whiteLabelEnabled);
    if (body.active !== undefined) updates.active = body.active;

    const reseller = await db.reseller.update({
      where: { id },
      data: updates,
      include: {
        _count: {
          select: { catalogs: true, clients: true, sales: true },
        },
      },
    });

    const { password: _pwd, ...sanitized } = reseller;

    return NextResponse.json({ success: true, data: sanitized });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update reseller' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.reseller.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reseller not found' },
        { status: 404 },
      );
    }

    await db.reseller.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete reseller' },
      { status: 500 },
    );
  }
}
