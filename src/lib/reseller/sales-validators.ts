import { z } from 'zod'

export const saleStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const
export type SaleStatus = (typeof saleStatuses)[number]

export const saleSchema = z.object({
  clientName: z.string().min(2, 'El nombre del cliente es obligatorio').max(100),
  clientEmail: z.string().email('Email inválido').max(100).default(''),
  bookingId: z.string().optional(),
  totalAmount: z.coerce.number().min(1, 'El monto debe ser mayor a 0'),
  notes: z.string().max(500).default(''),
})

export const updateSaleSchema = z.object({
  clientName: z.string().min(2, 'El nombre del cliente es obligatorio').max(100).optional(),
  clientEmail: z.string().email('Email inválido').max(100).optional(),
  bookingId: z.string().optional().nullable(),
  totalAmount: z.coerce.number().min(1).optional(),
  notes: z.string().max(500).optional(),
})

export const saleStatusSchema = z.object({
  status: z.enum(saleStatuses, { message: 'Estado inválido' }),
})

export const saleFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(saleStatuses).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type CreateSaleInput = z.infer<typeof saleSchema>
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>
export type SaleFilters = z.infer<typeof saleFiltersSchema>
