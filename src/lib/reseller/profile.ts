import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password.mjs'

export interface ResellerProfileData {
  id: string
  code: string
  contactName: string
  companyName: string
  email: string
  country: string
  phone: string
  website: string
  taxId: string
  address: string
  logoUrl: string | null
  sellerLevel: string
  commission: number
  whiteLabelEnabled: boolean
  approvalStatus: string
  active: boolean
  registrationDate: string
  documents: Array<{
    id: string
    docType: string
    fileName: string
    status: string
    uploadedAt: string
  }>
}

export async function getResellerProfile(resellerId: string): Promise<ResellerProfileData | null> {
  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    include: {
      documents: {
        select: {
          id: true,
          docType: true,
          fileName: true,
          status: true,
          uploadedAt: true,
        },
        orderBy: { uploadedAt: 'desc' },
      },
    },
  })

  if (!reseller) return null

  return {
    id: reseller.id,
    code: reseller.code,
    contactName: reseller.contactName,
    companyName: reseller.companyName,
    email: reseller.email,
    country: reseller.country,
    phone: reseller.phone,
    website: reseller.website,
    taxId: reseller.taxId,
    address: reseller.address,
    logoUrl: reseller.logoUrl,
    sellerLevel: reseller.sellerLevel,
    commission: reseller.commission,
    whiteLabelEnabled: reseller.whiteLabelEnabled,
    approvalStatus: reseller.approvalStatus,
    active: reseller.active,
    registrationDate: reseller.registrationDate.toISOString(),
    documents: reseller.documents.map((doc) => ({
      id: doc.id,
      docType: doc.docType,
      fileName: doc.fileName,
      status: doc.status,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
  }
}

export interface UpdateProfileInput {
  contactName: string
  companyName: string
  country: string
  phone: string
  website: string
  taxId: string
  address: string
  logoUrl?: string
}

export async function updateResellerProfile(resellerId: string, data: UpdateProfileInput) {
  return db.reseller.update({
    where: { id: resellerId },
    data: {
      contactName: data.contactName.trim(),
      companyName: data.companyName.trim(),
      country: data.country.trim(),
      phone: data.phone.trim(),
      website: data.website.trim(),
      taxId: data.taxId.trim(),
      address: data.address.trim(),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
    },
  })
}

export async function changeResellerPassword(resellerId: string, currentPassword: string, newPassword: string) {
  const reseller = await db.reseller.findUnique({
    where: { id: resellerId },
    select: { password: true },
  })

  if (!reseller) {
    throw new Error('Revendedor no encontrado')
  }

  const validPassword = await verifyPassword(reseller.password, currentPassword)
  if (!validPassword) {
    throw new Error('La contraseña actual no es correcta')
  }

  const hashedNewPassword = await hashPassword(newPassword)
  return db.reseller.update({
    where: { id: resellerId },
    data: { password: hashedNewPassword },
  })
}

export async function uploadResellerDocument(resellerId: string, docType: string, fileName: string, fileUrl: string) {
  return db.resellerDocument.create({
    data: {
      resellerId,
      docType,
      fileName,
      fileUrl,
    },
  })
}

export async function updateResellerLogo(resellerId: string, logoUrl: string) {
  return db.reseller.update({
    where: { id: resellerId },
    data: { logoUrl },
  })
}
