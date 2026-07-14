import { z } from 'zod'

const roomTypeSchema = z.object({
  name: z.string().optional(),
  maxGuests: z.number().int().positive().optional(),
  beds: z.string().optional(),
  basePrice: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  includes: z.array(z.string()).optional(),
  roomImage: z.string().optional(),
  roomImages: z.array(z.string()).optional(),
  active: z.boolean().optional(),
})

export const createHotelSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  cityId: z.string().min(1, 'El ID de ciudad es obligatorio'),
  cityName: z.string().min(1, 'El nombre de ciudad es obligatorio'),
  slug: z.string().optional(),
  destinationId: z.string().nullable().optional(),
  stars: z.number().int().min(1).max(5).optional(),
  address: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  priceFrom: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  resellerId: z.string().nullable().optional(),
  _pendingRoomTypes: z.array(roomTypeSchema).optional(),
})

export type CreateHotelInput = z.infer<typeof createHotelSchema>
