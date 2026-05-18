import { db } from '@/lib/db'

export interface CommissionSummary {
  totalEarned: number
  available: number
  pending: number
  withdrawn: number
}

export interface CommissionEntry {
  id: string
  saleId: string
  clientName: string
  destination: string
  commissionPercent: number
  amount: number
  status: 'available' | 'pending' | 'withdrawn'
  saleDate: string
}

export interface CommissionByDestination {
  name: string
  value: number
}

export interface MonthlyCommission {
  month: string
  amount: number
}

export interface CommissionData {
  summary: CommissionSummary
  history: CommissionEntry[]
  byDestination: CommissionByDestination[]
  monthly: MonthlyCommission[]
}

export async function getCommissionData(resellerId: string): Promise<CommissionData> {
  const [summary, sales] = await Promise.all([
    getCommissionSummary(resellerId),
    getCommissionSales(resellerId),
  ])

  const history = sales.map((sale) => ({
    id: sale.id,
    saleId: sale.id,
    clientName: sale.clientName || 'Sin cliente',
    destination: getDestinationFromSale(sale),
    commissionPercent: sale.totalAmount > 0 ? Math.round((sale.commissionAmt / sale.totalAmount) * 100) : 0,
    amount: sale.commissionAmt,
    status: getCommissionStatus(sale.status),
    saleDate: sale.saleDate.toISOString(),
  }))

  const byDestination = getCommissionsByDestination(sales)
  const monthly = getMonthlyCommissions(sales)

  return { summary, history, byDestination, monthly }
}

export async function getCommissionSummary(resellerId: string): Promise<CommissionSummary> {
  const [allSales, completedSales, pendingSales] = await Promise.all([
    db.resellerSale.aggregate({
      where: { resellerId, status: { in: ['completed', 'confirmed', 'pending'] } },
      _sum: { commissionAmt: true },
    }),
    db.resellerSale.aggregate({
      where: { resellerId, status: 'completed' },
      _sum: { commissionAmt: true },
    }),
    db.resellerSale.aggregate({
      where: { resellerId, status: 'pending' },
      _sum: { commissionAmt: true },
    }),
  ])

  const totalEarned = allSales._sum.commissionAmt ?? 0
  const pending = pendingSales._sum.commissionAmt ?? 0

  const confirmedCommission = await db.resellerSale.aggregate({
    where: { resellerId, status: 'confirmed' },
    _sum: { commissionAmt: true },
  })

  const available = (confirmedCommission._sum.commissionAmt ?? 0) + (allSales._sum.commissionAmt ?? 0 - (confirmedCommission._sum.commissionAmt ?? 0) - pending)
  const withdrawn = totalEarned - available - pending

  return {
    totalEarned,
    available: Math.max(0, available),
    pending,
    withdrawn: Math.max(0, withdrawn),
  }
}

async function getCommissionSales(resellerId: string) {
  return db.resellerSale.findMany({
    where: {
      resellerId,
      status: { in: ['completed', 'confirmed', 'pending'] },
    },
    orderBy: [{ saleDate: 'desc' }],
  })
}

function getCommissionStatus(saleStatus: string): 'available' | 'pending' | 'withdrawn' {
  switch (saleStatus) {
    case 'completed':
      return 'withdrawn'
    case 'confirmed':
      return 'available'
    case 'pending':
      return 'pending'
    default:
      return 'pending'
  }
}

function getDestinationFromSale(sale: { clientName: string; notes: string }): string {
  if (sale.notes) {
    const match = sale.notes.match(/destino:\s*(.+)/i)
    if (match) return match[1].trim()
  }
  return sale.clientName || 'Sin destino'
}

function getCommissionsByDestination(sales: Array<{ commissionAmt: number; notes: string }>): CommissionByDestination[] {
  const destMap = new Map<string, number>()

  for (const sale of sales) {
    const dest = getDestinationFromSale(sale)
    const current = destMap.get(dest) ?? 0
    destMap.set(dest, current + sale.commissionAmt)
  }

  return Array.from(destMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))
}

function getMonthlyCommissions(sales: Array<{ saleDate: Date; commissionAmt: number }>): MonthlyCommission[] {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthlyMap = new Map<string, number>()
  const now = new Date()

  for (const sale of sales) {
    const key = `${sale.saleDate.getFullYear()}-${sale.saleDate.getMonth()}`
    const current = monthlyMap.get(key) ?? 0
    monthlyMap.set(key, current + sale.commissionAmt)
  }

  const result: MonthlyCommission[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    result.push({
      month: monthNames[date.getMonth()],
      amount: monthlyMap.get(key) ?? 0,
    })
  }

  return result
}
