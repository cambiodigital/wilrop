import { z } from 'zod'

export const createDestinationSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  region: z.string().min(1, 'La región es obligatoria').max(200),
  description: z.string().min(1, 'La descripción es obligatoria').max(5000),
  image: z.string().min(1, 'La imagen es obligatoria'),
  slug: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  priceFrom: z.number().min(0).optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  resellerId: z.string().nullable().optional(),
})

export type CreateDestinationInput = z.infer<typeof createDestinationSchema>
