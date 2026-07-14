import { db } from '@/lib/db'

export interface SubagentDashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  totalRevenue: number
  totalCommissions: number
  monthlyBookings: number
  monthlyRevenue: number
  monthlyCommissions: number
}

export interface RecentBookingData {
  id: string
  code: string
  guestName: string
  totalPrice: number
  commissionAmt: number
  subagentCommissionAmt: number
  status: string
  createdAt: string
}

export interface SubagentDashboardData {
  stats: SubagentDashboardStats
  recentBookings: RecentBookingData[]
}

export async function getSubagentDashboardData(subagentId: string): Promise<SubagentDashboardData> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    revenueAgg,
    commissionAgg,
    monthlyBookings,
    monthlyRevenueAgg,
    monthlyCommissionAgg,
    recentBookings,
  ] = await Promise.all([
    db.booking.count({
      where: { subagentId },
    }),
    db.booking.count({
      where: { subagentId, status: 'pending' },
    }),
    db.booking.count({
      where: { subagentId, status: 'confirmed' },
    }),
    db.booking.count({
      where: { subagentId, status: 'cancelled' },
    }),
    db.booking.aggregate({
      where: { subagentId },
      _sum: { totalPrice: true },
    }),
    db.booking.aggregate({
      where: { subagentId },
      _sum: { subagentCommissionAmt: true },
    }),
    db.booking.count({
      where: {
        subagentId,
        createdAt: { gte: firstDayOfMonth },
      },
    }),
    db.booking.aggregate({
      where: {
        subagentId,
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    db.booking.aggregate({
      where: {
        subagentId,
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: { subagentCommissionAmt: true },
    }),
    db.booking.findMany({
      where: { subagentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        code: true,
        guestName: true,
        totalPrice: true,
        commissionAmt: true,
        subagentCommissionAmt: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  return {
    stats: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: revenueAgg._sum.totalPrice ?? 0,
      totalCommissions: commissionAgg._sum.subagentCommissionAmt ?? 0,
      monthlyBookings,
      monthlyRevenue: monthlyRevenueAgg._sum.totalPrice ?? 0,
      monthlyCommissions: monthlyCommissionAgg._sum.subagentCommissionAmt ?? 0,
    },
    recentBookings: recentBookings.map((booking) => ({
      id: booking.id,
      code: booking.code,
      guestName: booking.guestName || 'Sin nombre',
      totalPrice: booking.totalPrice,
      commissionAmt: booking.commissionAmt,
      subagentCommissionAmt: booking.subagentCommissionAmt,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    })),
  }
}
