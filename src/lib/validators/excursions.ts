import { z } from 'zod'

export const createExcursionSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  slug: z.string().optional(),
  destinationId: z.string().optional(),
  destinationName: z.string().optional(),
  cityName: z.string().optional(),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(500).optional(),
  images: z.array(z.string()).optional(),
  duration: z.string().max(100).optional(),
  difficulty: z.string().max(50).optional(),
  groupSize: z.union([z.string(), z.number()]).optional(),
  basePrice: z.number().min(0).optional(),
  childPrice: z.number().min(0).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  resellerId: z.string().nullable().optional(),
})

export type CreateExcursionInput = z.infer<typeof createExcursionSchema>
