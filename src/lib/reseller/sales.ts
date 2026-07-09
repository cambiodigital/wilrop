import { db } from '@/lib/db'
import type { CreateSaleInput, UpdateSaleInput, SaleFilters } from './sales-validators'

export interface SaleBookingItem {
  id: string
  itemType: string
  serviceId: string
  serviceName: string
  roomTypeId: string
  roomName: string
  dateFrom: string
  dateTo: string
  quantity: number
  unitPrice: number
  totalPrice: number
  addons: Array<{ type: string; price: number }>
}

export interface ResellerSaleData {
  id: string
  resellerId: string
  bookingId: string | null
  clientName: string
  clientEmail: string
  totalAmount: number
  commissionAmt: number
  netAmount: number
  status: string
  saleDate: string
  notes: string
  createdAt: string
  updatedAt: string
  bookingCode: string
  bookingServiceName: string
  bookingGuestName: string
  clientEmailFromRecord: string
  items: SaleBookingItem[]
}

function parseBookingItems(items: any[]): SaleBookingItem[] {
  return items.map((item) => ({
    id: item.id,
    itemType: item.itemType,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    roomTypeId: item.roomTypeId,
    roomName: item.roomName,
    dateFrom: item.dateFrom,
    dateTo: item.dateTo,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    addons: typeof item.addons === 'string' ? JSON.parse(item.addons || '[]') : (item.addons || []),
  }))
}

export async function getResellerSales(
  resellerId: string,
  filters?: SaleFilters,
): Promise<ResellerSaleData[]> {
  const sales = await db.resellerSale.findMany({
    where: {
      resellerId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { clientName: { contains: filters.search, mode: 'insensitive' } },
              { clientEmail: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters?.dateFrom ? { saleDate: { gte: new Date(filters.dateFrom) } } : {}),
      ...(filters?.dateTo ? { saleDate: { lte: new Date(filters.dateTo + 'T23:59:59.999Z') } } : {}),
    },
    orderBy: [{ saleDate: 'desc' }, { createdAt: 'desc' }],
  })

  const result: ResellerSaleData[] = []
  for (const sale of sales) {
    const bookingDetails = await getBookingDetails(sale.bookingId)
    result.push(mapSaleData(sale, bookingDetails))
  }

  return result
}

export async function getResellerSale(resellerId: string, saleId: string): Promise<ResellerSaleData | null> {
  const sale = await db.resellerSale.findUnique({
    where: { id: saleId },
  })

  if (!sale || sale.resellerId !== resellerId) return null

  const bookingDetails = await getBookingDetails(sale.bookingId)
  return mapSaleData(sale, bookingDetails)
}

export async function createResellerSale(
  resellerId: string,
  data: CreateSaleInput & { commissionPercent: number },
): Promise<ResellerSaleData> {
  const commissionAmt = Math.round(data.totalAmount * (data.commissionPercent / 100))
  const netAmount = data.totalAmount - commissionAmt

  let bookingCode = ''
  let bookingServiceName = ''
  let bookingGuestName = ''
  let bookingItems: SaleBookingItem[] = []

  if (data.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: data.bookingId },
      select: { resellerId: true, code: true, guestName: true, items: true },
    })

    if (!booking) {
      throw new Error('Booking no encontrado')
    }

    if (booking.resellerId && booking.resellerId !== resellerId) {
      throw new Error('Este booking no pertenece a este revendedor')
    }

    bookingCode = booking.code
    bookingGuestName = booking.guestName
    bookingItems = parseBookingItems(booking.items)
    bookingServiceName = bookingItems.length > 0
      ? bookingItems.map((i) => i.serviceName).join(', ')
      : 'Reserva'

    await db.booking.update({
      where: { id: data.bookingId },
      data: {
        resellerId,
        guestName: data.clientName.trim(),
        guestEmail: data.clientEmail.trim().toLowerCase(),
      },
    })
  }

  const sale = await db.resellerSale.create({
    data: {
      resellerId,
      bookingId: data.bookingId || null,
      clientName: data.clientName.trim(),
      clientEmail: data.clientEmail.trim().toLowerCase(),
      totalAmount: data.totalAmount,
      commissionAmt,
      netAmount,
      notes: data.notes.trim(),
    },
  })

  return mapSaleData(sale, { code: bookingCode, serviceName: bookingServiceName, guestName: bookingGuestName, items: bookingItems })
}

export async function updateResellerSale(
  resellerId: string,
  saleId: string,
  data: UpdateSaleInput,
): Promise<ResellerSaleData> {
  const existing = await db.resellerSale.findUnique({
    where: { id: saleId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Venta no encontrada o sin permisos')
  }

  const updateData: Record<string, unknown> = {}
  if (data.clientName !== undefined) updateData.clientName = data.clientName.trim()
  if (data.clientEmail !== undefined) updateData.clientEmail = data.clientEmail.trim().toLowerCase()
  if (data.totalAmount !== undefined) {
    updateData.totalAmount = data.totalAmount
    const commissionAmt = Math.round(data.totalAmount * (existing.commissionAmt / Math.max(existing.totalAmount, 1)))
    updateData.commissionAmt = commissionAmt
    updateData.netAmount = data.totalAmount - commissionAmt
  }
  if (data.notes !== undefined) updateData.notes = data.notes.trim()
  if (data.bookingId !== undefined) updateData.bookingId = data.bookingId

  const sale = await db.resellerSale.update({
    where: { id: saleId },
    data: updateData,
  })

  const bookingDetails = await getBookingDetails(sale.bookingId)
  return mapSaleData(sale, bookingDetails)
}

export async function updateSaleStatus(
  resellerId: string,
  saleId: string,
  status: string,
): Promise<ResellerSaleData> {
  const existing = await db.resellerSale.findUnique({
    where: { id: saleId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Venta no encontrada o sin permisos')
  }

  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  }

  const allowed = validTransitions[existing.status] || []
  if (!allowed.includes(status)) {
    throw new Error(`No se puede cambiar el estado de "${existing.status}" a "${status}"`)
  }

  const sale = await db.resellerSale.update({
    where: { id: saleId },
    data: { status },
  })

  if (existing.bookingId) {
    await db.booking.update({
      where: { id: existing.bookingId },
      data: { status },
    })
  }

  const bookingDetails = await getBookingDetails(sale.bookingId)
  return mapSaleData(sale, bookingDetails)
}

export async function deleteResellerSale(resellerId: string, saleId: string): Promise<void> {
  const existing = await db.resellerSale.findUnique({
    where: { id: saleId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Venta no encontrada o sin permisos')
  }

  if (existing.status === 'completed' || existing.status === 'confirmed') {
    throw new Error('No se pueden eliminar ventas confirmadas o completadas')
  }

  await db.resellerSale.delete({
    where: { id: saleId },
  })
}

export async function getResellerSaleCount(resellerId: string): Promise<number> {
  return db.resellerSale.count({
    where: { resellerId },
  })
}

export async function getResellerCommissionPercent(resellerId: string): Promise<number> {
  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    select: { commission: true },
  })

  return reseller?.commission ?? 0
}

async function getBookingDetails(bookingId: string | null): Promise<{
  code: string
  serviceName: string
  guestName: string
  items: SaleBookingItem[]
}> {
  if (!bookingId) return { code: '', serviceName: '', guestName: '', items: [] }
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: { code: true, guestName: true, items: true },
    })
    if (!booking) return { code: '', serviceName: '', guestName: '', items: [] }

    const items = parseBookingItems(booking.items)
    const serviceName = items.length > 0
      ? items.map((i) => i.serviceName).join(', ')
      : 'Reserva'

    return { code: booking.code, serviceName, guestName: booking.guestName, items }
  } catch {
    return { code: '', serviceName: '', guestName: '', items: [] }
  }
}

function mapSaleData(
  sale: any,
  bookingDetails: { code: string; serviceName: string; guestName: string; items: SaleBookingItem[] },
): ResellerSaleData {
  return {
    id: sale.id,
    resellerId: sale.resellerId,
    bookingId: sale.bookingId,
    clientName: sale.clientName,
    clientEmail: sale.clientEmail,
    totalAmount: sale.totalAmount,
    commissionAmt: sale.commissionAmt,
    netAmount: sale.netAmount,
    status: sale.status,
    saleDate: sale.saleDate.toISOString(),
    notes: sale.notes,
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    bookingCode: bookingDetails.code,
    bookingServiceName: bookingDetails.serviceName,
    bookingGuestName: bookingDetails.guestName,
    clientEmailFromRecord: sale.clientEmail,
    items: bookingDetails.items,
  }
}
