import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPanelSessionCookieName, verifyPanelSessionToken } from '@/lib/panel-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get(getPanelSessionCookieName('reseller'))?.value
    const session = verifyPanelSessionToken(sessionValue, 'reseller')

    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const sourceType = url.searchParams.get('sourceType')

    const existingCatalog = await db.resellerCatalog.findMany({
      where: { resellerId: session.id },
      select: { sourceType: true, sourceId: true },
    })
    const existingIds = new Set(existingCatalog.map((c) => `${c.sourceType}:${c.sourceId}`))

    let items: Array<Record<string, unknown>> = []

    const baseWhere = { active: true, isTemplate: false }

    if (!sourceType || sourceType === 'hotel') {
      const hotels = await db.hotel.findMany({
        where: baseWhere,
        select: { id: true, name: true, cityName: true, stars: true, priceFrom: true, images: true, description: true },
        orderBy: { name: 'asc' },
      })
      items.push(
        ...hotels.map((h) => ({
          sourceType: 'hotel' as const,
          sourceId: h.id,
          name: h.name,
          location: h.cityName,
          price: h.priceFrom,
          image: parseImagesArray(h.images)[0] || '',
          description: h.description,
          metadata: { stars: h.stars },
          alreadyInCatalog: existingIds.has(`hotel:${h.id}`),
        })),
      )
    }

    if (!sourceType || sourceType === 'excursion') {
      const excursions = await db.excursion.findMany({
        where: baseWhere,
        select: { id: true, name: true, cityName: true, basePrice: true, images: true, description: true, category: true },
        orderBy: { name: 'asc' },
      })
      items.push(
        ...excursions.map((e) => ({
          sourceType: 'excursion' as const,
          sourceId: e.id,
          name: e.name,
          location: e.cityName,
          price: e.basePrice,
          image: parseImagesArray(e.images)[0] || '',
          description: e.description,
          metadata: { category: e.category },
          alreadyInCatalog: existingIds.has(`excursion:${e.id}`),
        })),
      )
    }

    if (!sourceType || sourceType === 'package') {
      const packages = await db.travelPackage.findMany({
        where: baseWhere,
        select: { id: true, title: true, destinationName: true, price: true, image: true, description: true, category: true },
        orderBy: { title: 'asc' },
      })
      items.push(
        ...packages.map((p) => ({
          sourceType: 'package' as const,
          sourceId: p.id,
          name: p.title,
          location: p.destinationName,
          price: p.price,
          image: p.image,
          description: p.description,
          metadata: { category: p.category },
          alreadyInCatalog: existingIds.has(`package:${p.id}`),
        })),
      )
    }

    if (!sourceType || sourceType === 'transport') {
      const transports = await db.transportService.findMany({
        where: baseWhere,
        select: {
          id: true,
          name: true,
          origin: true,
          destination: true,
          basePrice: true,
          notes: true,
          providerId: true,
          provider: { select: { name: true, vehicleType: true, capacity: true } },
        },
        orderBy: { name: 'asc' },
      })
      items.push(
        ...transports.map((t) => ({
          sourceType: 'transport' as const,
          sourceId: t.id,
          name: t.name,
          location: `${t.origin} → ${t.destination}`,
          price: t.basePrice,
          image: '',
          description: t.notes,
          metadata: { provider: t.provider?.name, vehicleType: t.provider?.vehicleType, capacity: t.provider?.capacity },
          alreadyInCatalog: existingIds.has(`transport:${t.id}`),
        })),
      )
    }

    if (!sourceType || sourceType === 'destination') {
      const destinations = await db.destination.findMany({
        where: baseWhere,
        select: { id: true, name: true, region: true, description: true, image: true, priceFrom: true },
        orderBy: { name: 'asc' },
      })
      items.push(
        ...destinations.map((d) => ({
          sourceType: 'destination' as const,
          sourceId: d.id,
          name: d.name,
          location: d.region,
          price: d.priceFrom,
          image: d.image,
          description: d.description,
          metadata: {},
          alreadyInCatalog: existingIds.has(`destination:${d.id}`),
        })),
      )
    }

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[ResellerAvailableProducts] Error:', error)
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los productos disponibles' },
      { status: 500 },
    )
  }
}

function parseImagesArray(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson) as string[]
  } catch {
    return []
  }
}
