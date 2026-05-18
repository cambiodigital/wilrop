import { db } from '@/lib/db'

export interface DashboardStats {
  monthlySales: number
  monthlyCommission: number
  activeClients: number
  catalogItems: number
  pendingBookings: number
}

export interface MonthlySaleData {
  month: string
  ventas: number
}

export interface TopDestinationData {
  name: string
  ventas: number
}

export interface RecentSaleData {
  id: string
  clientName: string
  total: number
  commission: number
  status: string
  saleDate: string
}

export interface DashboardData {
  stats: DashboardStats
  monthlySales: MonthlySaleData[]
  topDestinations: TopDestinationData[]
  recentSales: RecentSaleData[]
}

export async function getDashboardData(resellerId: string): Promise<DashboardData> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    monthlySalesAgg,
    monthlyCommissionAgg,
    activeClients,
    catalogItems,
    pendingBookings,
    recentSales,
  ] = await Promise.all([
    db.resellerSale.aggregate({
      where: {
        resellerId,
        saleDate: { gte: firstDayOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    db.resellerSale.aggregate({
      where: {
        resellerId,
        saleDate: { gte: firstDayOfMonth },
      },
      _sum: { commissionAmt: true },
    }),
    db.resellerClient.count({
      where: { resellerId },
    }),
    db.resellerCatalog.count({
      where: { resellerId, active: true },
    }),
    db.resellerSale.count({
      where: { resellerId, status: 'pending' },
    }),
    db.resellerSale.findMany({
      where: { resellerId },
      orderBy: { saleDate: 'desc' },
      take: 5,
    }),
  ])

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const monthlySales = await getMonthlySales(resellerId, sixMonthsAgo)

  const topDestinations = await getTopDestinations(resellerId, firstDayOfMonth)

  return {
    stats: {
      monthlySales: monthlySalesAgg._sum.totalAmount ?? 0,
      monthlyCommission: monthlyCommissionAgg._sum.commissionAmt ?? 0,
      activeClients,
      catalogItems,
      pendingBookings,
    },
    monthlySales,
    topDestinations,
    recentSales: recentSales.map((sale) => ({
      id: sale.id,
      clientName: sale.clientName || 'Sin cliente',
      total: sale.totalAmount,
      commission: sale.commissionAmt,
      status: sale.status,
      saleDate: sale.saleDate.toISOString(),
    })),
  }
}

async function getMonthlySales(resellerId: string, startDate: Date): Promise<MonthlySaleData[]> {
  const sales = await db.resellerSale.groupBy({
    by: ['saleDate'],
    where: {
      resellerId,
      saleDate: { gte: startDate },
    },
    _sum: { totalAmount: true },
    orderBy: { saleDate: 'asc' },
  })

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyMap = new Map<string, number>()

  for (const sale of sales) {
    const key = `${sale.saleDate.getFullYear()}-${sale.saleDate.getMonth()}`
    const current = monthlyMap.get(key) ?? 0
    monthlyMap.set(key, current + (sale._sum.totalAmount ?? 0))
  }

  const result: MonthlySaleData[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    result.push({
      month: monthNames[date.getMonth()],
      ventas: monthlyMap.get(key) ?? 0,
    })
  }

  return result
}

async function getTopDestinations(resellerId: string, startDate: Date): Promise<TopDestinationData[]> {
  const sales = await db.resellerSale.findMany({
    where: {
      resellerId,
      saleDate: { gte: startDate },
    },
    select: { clientName: true, totalAmount: true },
    orderBy: { totalAmount: 'desc' },
    take: 5,
  })

  return sales
    .filter((s) => s.clientName)
    .map((s) => ({
      name: s.clientName ?? 'Sin nombre',
      ventas: s.totalAmount,
    }))
}
