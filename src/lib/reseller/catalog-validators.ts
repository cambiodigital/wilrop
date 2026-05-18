import { z } from 'zod'

export const sourceTypeEnum = z.enum(['hotel', 'excursion', 'package', 'transport', 'destination', 'room'])

export const catalogItemSchema = z.object({
  sourceType: sourceTypeEnum,
  sourceId: z.string().min(1, 'El ID del producto es obligatorio'),
  customPrice: z.number().int().min(0).optional().nullable(),
  customName: z.string().max(200).optional().or(z.literal('')),
  customDescription: z.string().max(1000).optional().or(z.literal('')),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
})

export const updateCatalogItemSchema = z.object({
  customPrice: z.number().int().min(0).nullable().optional(),
  customName: z.string().max(200).optional(),
  customDescription: z.string().max(1000).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const catalogFiltersSchema = z.object({
  sourceType: sourceTypeEnum.optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  search: z.string().max(100).optional(),
})

export type CatalogItemInput = z.infer<typeof catalogItemSchema>
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>
export type CatalogFilters = z.infer<typeof catalogFiltersSchema>
