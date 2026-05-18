import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPanelSessionToken, getPanelSessionCookieName } from '@/lib/panel-auth';

async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookieName = getPanelSessionCookieName('admin');
  const sessionToken = request.cookies.get(cookieName)?.value;
  const session = verifyPanelSessionToken(sessionToken, 'admin');
  return !!session;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const reseller = await db.reseller.findUnique({ where: { id } });
    if (!reseller) {
      return NextResponse.json({ error: 'Revendedor no encontrado' }, { status: 404 });
    }

    const [totalSales, totalRevenue, totalClients, catalogItems, recentSales, bookingStats] = await Promise.all([
      db.resellerSale.count({ where: { resellerId: id } }),
      db.resellerSale.aggregate({
        where: { resellerId: id },
        _sum: { totalAmount: true, commissionAmt: true },
      }),
      db.resellerClient.count({ where: { resellerId: id } }),
      db.resellerCatalog.count({ where: { resellerId: id, active: true } }),
      db.resellerSale.findMany({
        where: { resellerId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.booking.groupBy({
        by: ['status'],
        where: { resellerId: id },
        _count: true,
        _sum: { totalPrice: true, commissionAmt: true },
      }),
    ]);

    const bookingsByStatus: Record<string, { count: number; revenue: number; commission: number }> = {};
    for (const group of bookingStats) {
      bookingsByStatus[group.status] = {
        count: group._count,
        revenue: group._sum.totalPrice ?? 0,
        commission: group._sum.commissionAmt ?? 0,
      };
    }

    const totalBookings = bookingStats.reduce((sum, g) => sum + g._count, 0);
    const totalBookingRevenue = bookingStats.reduce((sum, g) => sum + (g._sum.totalPrice ?? 0), 0);
    const totalBookingCommission = bookingStats.reduce((sum, g) => sum + (g._sum.commissionAmt ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        totalCommission: totalRevenue._sum.commissionAmt ?? 0,
        totalClients,
        catalogItems,
        recentSales,
        bookings: {
          total: totalBookings,
          revenue: totalBookingRevenue,
          commission: totalBookingCommission,
          byStatus: bookingsByStatus,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
