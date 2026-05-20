import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function isMissingDatabaseObjectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? (error as { code?: unknown }).code : undefined
  if (code === 'P2021' || code === 'P2022') return true
  const message = 'message' in error ? (error as { message?: unknown }).message : undefined
  if (typeof message !== 'string') return false
  return (
    message.includes('does not exist') ||
    message.includes('no such table') ||
    (message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist'))
  )
}

async function safeCount(model: string, where: any): Promise<number> {
  try {
    return await (db as any)[model].count({ where })
  } catch (error) {
    if (isMissingDatabaseObjectError(error)) return 0
    throw error
  }
}

export async function GET() {
  try {
    const realDestinations = await db.destination.count({
      where: { active: true, isTemplate: false },
    })
    const realHotels = await db.hotel.count({
      where: { active: true, isTemplate: false },
    })
    const realPackages = await db.travelPackage.count({
      where: { active: true, isTemplate: false },
    })

    const destWhere = { active: true, isTemplate: realDestinations > 0 ? false : true }
    const hotelWhere = { active: true, isTemplate: realHotels > 0 ? false : true }
    const packageWhere = { active: true, isTemplate: realPackages > 0 ? false : true }

    const [
      totalDestinations,
      totalHotels,
      totalPackages,
      totalExcursions,
      totalTransportServices,
      totalBookings,
    ] = await Promise.all([
      safeCount('destination', destWhere),
      safeCount('hotel', hotelWhere),
      safeCount('travelPackage', packageWhere),
      safeCount('excursion', { active: true }),
      safeCount('transportService', { active: true }),
      safeCount('booking', {}),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalDestinations,
        totalHotels,
        totalPackages,
        totalExcursions,
        totalTransportServices,
        totalBookings,
      },
    })
  } catch (error: any) {
    console.error('Error fetching public stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 },
    )
  }
}
