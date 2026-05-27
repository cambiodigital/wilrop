import { z } from 'zod'

const addonSchema = z.object({
  type: z.string(),
  price: z.number(),
})

const bookingItemSchema = z.object({
  itemType: z.enum(['hotel', 'transport', 'excursion', 'package', 'cruise']),
  serviceId: z.string().min(1),
  serviceName: z.string().optional(),
  roomTypeId: z.string().optional(),
  roomName: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  quantity: z.number().min(1).optional(),
  unitPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  addons: z.array(addonSchema).optional(),
})

export const createBookingSchema = z.object({
  subagentCode: z.string().optional().nullable(),
  guestName: z.string().min(1, 'El nombre es obligatorio').max(200),
  guestEmail: z.string().email('Email inválido').max(200),
  guestPhone: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').max(30),
  guestCountry: z.string().max(100).optional(),
  adults: z.number().int().min(1).max(50).optional(),
  children: z.number().int().min(0).max(30).optional(),
  childrenAges: z.array(z.number()).optional(),
  notes: z.string().max(2000).optional(),
  totalPrice: z.number().min(0),
  netPrice: z.number().optional(),
  commissionAmt: z.number().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  items: z.array(bookingItemSchema).min(1, 'Al menos un item es requerido'),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export function validateBookingInput(body: unknown) {
  return createBookingSchema.safeParse(body)
}
