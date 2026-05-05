import { brand } from '@/lib/brand'

export function toPhoneDigits(value: string) {
  return value.replace(/[^0-9]/g, '')
}

export const supportPhone = brand.phone
export const supportPhoneDigits = toPhoneDigits(brand.phone)
export const supportTelUrl = `tel:+${supportPhoneDigits}`
export const supportWhatsAppUrl = `https://wa.me/${supportPhoneDigits}`

