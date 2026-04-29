import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subagent = await db.subagent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!subagent) {
      return NextResponse.json(
        { success: false, error: 'Subagent not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: unknown) {
    console.error('Error fetching subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subagent' },
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

    const existing = await db.subagent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Subagent not found' },
        { status: 404 }
      );
    }

    // Check uniqueness of code and email if being updated
    if (body.code && body.code !== existing.code) {
      const existingByCode = await db.subagent.findUnique({ where: { code: body.code } });
      if (existingByCode) {
        return NextResponse.json(
          { success: false, error: 'A subagent with this code already exists' },
          { status: 409 }
        );
      }
    }

    if (body.email && body.email !== existing.email) {
      const existingByEmail = await db.subagent.findUnique({ where: { email: body.email } });
      if (existingByEmail) {
        return NextResponse.json(
          { success: false, error: 'A subagent with this email already exists' },
          { status: 409 }
        );
      }
    }

    const updates: any = {};

    if (body.code !== undefined) updates.code = body.code;
    if (body.email !== undefined) updates.email = body.email;
    if (body.password !== undefined) updates.password = body.password;
    if (body.agencyName !== undefined) updates.agencyName = body.agencyName;
    if (body.contactName !== undefined) updates.contactName = body.contactName;
    if (body.country !== undefined) updates.country = body.country;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.commission !== undefined) updates.commission = body.commission;
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

    // Remove password from response
    const { password: _pwd, ...sanitized } = subagent;

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: unknown) {
    console.error('Error updating subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subagent' },
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

    const existing = await db.subagent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Subagent not found' },
        { status: 404 }
      );
    }

    await db.subagent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting subagent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subagent' },
      { status: 500 }
    );
  }
}
