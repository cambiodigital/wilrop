import { z } from 'zod'

export const profileFormSchema = z.object({
  contactName: z.string().min(2, 'El nombre de contacto debe tener al menos 2 caracteres').max(100),
  companyName: z.string().min(2, 'El nombre de empresa debe tener al menos 2 caracteres').max(150),
  country: z.string().max(50).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  taxId: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(128),
})

export const documentUploadSchema = z.object({
  docType: z.enum(['id', 'business_license', 'tax_certificate', 'bank_statement', 'other']),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url('URL de archivo inválida'),
})

export type ProfileFormInput = z.infer<typeof profileFormSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
