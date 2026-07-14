import { z } from 'zod'

export const createPackageSchema = z.object({
  destinationId: z.string().min(1, 'El destino es obligatorio'),
  destinationName: z.string().min(1, 'El nombre del destino es obligatorio'),
  title: z.string().min(1, 'El título es obligatorio').max(300),
  duration: z.string().min(1, 'La duración es obligatoria').max(100),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  slug: z.string().optional(),
  description: z.string().max(5000).optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  includes: z.array(z.string()).optional(),
  image: z.string().optional(),
  difficulty: z.string().max(50).optional(),
  groupSize: z.string().max(50).optional(),
  departureDates: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  soldOut: z.boolean().optional(),
  category: z.string().max(100).optional(),
  commission: z.number().min(0).max(100).optional(),
  active: z.boolean().optional(),
  resellerId: z.string().nullable().optional(),
})

export type CreatePackageInput = z.infer<typeof createPackageSchema>
