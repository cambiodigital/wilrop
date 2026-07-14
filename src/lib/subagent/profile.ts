import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password.mjs'

export interface SubagentProfileData {
  id: string
  code: string
  contactName: string
  agencyName: string
  email: string
  country: string
  phone: string
  commission: number
  sellerLevel: string
  whiteLabelEnabled: boolean
  approvalStatus: string
  active: boolean
  registrationDate: string
}

export async function getSubagentProfile(subagentId: string): Promise<SubagentProfileData | null> {
  const subagent = await db.subagent.findUnique({
    where: { id: subagentId },
  })

  if (!subagent) return null

  return {
    id: subagent.id,
    code: subagent.code,
    contactName: subagent.contactName,
    agencyName: subagent.agencyName,
    email: subagent.email,
    country: subagent.country,
    phone: subagent.phone,
    commission: subagent.commission,
    sellerLevel: subagent.sellerLevel,
    whiteLabelEnabled: subagent.whiteLabelEnabled,
    approvalStatus: subagent.approvalStatus,
    active: subagent.active,
    registrationDate: subagent.registrationDate.toISOString(),
  }
}

export interface UpdateSubagentProfileInput {
  contactName: string
  agencyName: string
  country: string
  phone: string
}

export async function updateSubagentProfile(subagentId: string, data: UpdateSubagentProfileInput) {
  return db.subagent.update({
    where: { id: subagentId },
    data: {
      contactName: data.contactName.trim(),
      agencyName: data.agencyName.trim(),
      country: data.country.trim(),
      phone: data.phone.trim(),
    },
  })
}

export async function changeSubagentPassword(subagentId: string, currentPassword: string, newPassword: string) {
  const subagent = await db.subagent.findUnique({
    where: { id: subagentId },
    select: { password: true },
  })

  if (!subagent) {
    throw new Error('Subagente no encontrado')
  }

  const validPassword = await verifyPassword(subagent.password, currentPassword)
  if (!validPassword) {
    throw new Error('La contraseña actual no es correcta')
  }

  const hashedNewPassword = await hashPassword(newPassword)
  return db.subagent.update({
    where: { id: subagentId },
    data: { password: hashedNewPassword },
  })
}
