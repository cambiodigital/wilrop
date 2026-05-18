import { db } from '@/lib/db'
import type { CreateClientInput, UpdateClientInput, ClientFilters } from './clients-validators'

export interface ResellerClientData {
  id: string
  name: string
  email: string
  phone: string
  country: string
  passport: string
  notes: string
  totalPurchases: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export async function getResellerClients(resellerId: string, filters?: ClientFilters): Promise<ResellerClientData[]> {
  const clients = await db.resellerClient.findMany({
    where: {
      resellerId,
      ...(filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { country: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ totalSpent: 'desc' }, { createdAt: 'desc' }],
  })

  return clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    country: client.country,
    passport: client.passport,
    notes: client.notes,
    totalPurchases: client.totalPurchases,
    totalSpent: client.totalSpent,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }))
}

export async function getResellerClient(resellerId: string, clientId: string): Promise<ResellerClientData | null> {
  const client = await db.resellerClient.findUnique({
    where: { id: clientId },
  })

  if (!client || client.resellerId !== resellerId) return null

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    country: client.country,
    passport: client.passport,
    notes: client.notes,
    totalPurchases: client.totalPurchases,
    totalSpent: client.totalSpent,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }
}

export async function createResellerClient(resellerId: string, data: CreateClientInput): Promise<ResellerClientData> {
  const client = await db.resellerClient.create({
    data: {
      resellerId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      country: data.country.trim(),
      passport: data.passport.trim(),
      notes: data.notes.trim(),
    },
  })

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    country: client.country,
    passport: client.passport,
    notes: client.notes,
    totalPurchases: client.totalPurchases,
    totalSpent: client.totalSpent,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }
}

export async function updateResellerClient(
  resellerId: string,
  clientId: string,
  data: UpdateClientInput,
): Promise<ResellerClientData> {
  const existing = await db.resellerClient.findUnique({
    where: { id: clientId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Cliente no encontrado o sin permisos')
  }

  const client = await db.resellerClient.update({
    where: { id: clientId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
      ...(data.phone !== undefined && { phone: data.phone.trim() }),
      ...(data.country !== undefined && { country: data.country.trim() }),
      ...(data.passport !== undefined && { passport: data.passport.trim() }),
      ...(data.notes !== undefined && { notes: data.notes.trim() }),
    },
  })

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    country: client.country,
    passport: client.passport,
    notes: client.notes,
    totalPurchases: client.totalPurchases,
    totalSpent: client.totalSpent,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }
}

export async function deleteResellerClient(resellerId: string, clientId: string): Promise<void> {
  const existing = await db.resellerClient.findUnique({
    where: { id: clientId },
  })

  if (!existing || existing.resellerId !== resellerId) {
    throw new Error('Cliente no encontrado o sin permisos')
  }

  await db.resellerClient.delete({
    where: { id: clientId },
  })
}

export async function getResellerClientCount(resellerId: string): Promise<number> {
  return db.resellerClient.count({
    where: { resellerId },
  })
}
