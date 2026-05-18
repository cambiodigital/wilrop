import { db } from '@/lib/db'
import type { Reseller } from '@prisma/client'

export async function listResellers() {
  return db.reseller.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { catalogs: true, clients: true, sales: true },
      },
    },
  })
}

export async function getResellerDetail(id: string) {
  return db.reseller.findUnique({
    where: { id },
    include: {
      _count: {
        select: { catalogs: true, clients: true, sales: true, documents: true },
      },
    },
  })
}

export async function approveReseller(adminId: string, resellerId: string) {
  return db.reseller.update({
    where: { id: resellerId },
    data: {
      active: true,
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: '',
    },
  })
}

export async function rejectReseller(resellerId: string, reason: string) {
  return db.reseller.update({
    where: { id: resellerId },
    data: {
      active: false,
      approvalStatus: 'rejected',
      rejectionReason: reason.trim(),
    },
  })
}

export async function updateResellerLevel(resellerId: string, level: string) {
  return db.reseller.update({
    where: { id: resellerId },
    data: { sellerLevel: level },
  })
}

export async function toggleResellerActive(resellerId: string, active: boolean) {
  return db.reseller.update({
    where: { id: resellerId },
    data: { active },
  })
}

export async function getResellerStats(resellerId: string) {
  const [totalSales, totalRevenue, totalClients, catalogItems, recentSales] = await Promise.all([
    db.resellerSale.count({ where: { resellerId } }),
    db.resellerSale.aggregate({
      where: { resellerId },
      _sum: { totalAmount: true, commissionAmt: true },
    }),
    db.resellerClient.count({ where: { resellerId } }),
    db.resellerCatalog.count({ where: { resellerId, active: true } }),
    db.resellerSale.findMany({
      where: { resellerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return {
    totalSales,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    totalCommission: totalRevenue._sum.commissionAmt ?? 0,
    totalClients,
    catalogItems,
    recentSales,
  }
}
