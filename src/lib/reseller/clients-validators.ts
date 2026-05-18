import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').max(100, 'El email es demasiado largo'),
  phone: z.string().max(20, 'El teléfono es demasiado largo').default(''),
  country: z.string().max(60, 'El país es demasiado largo').default(''),
  passport: z.string().max(30, 'El pasaporte es demasiado largo').default(''),
  notes: z.string().max(500, 'Las notas son demasiado largas').default(''),
})

export const updateClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  email: z.string().email('Email inválido').max(100).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(60).optional(),
  passport: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
})

export const clientFiltersSchema = z.object({
  search: z.string().max(100).optional(),
})

export type CreateClientInput = z.infer<typeof clientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientFilters = z.infer<typeof clientFiltersSchema>
