import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import HotelBookingFlow from '@/components/portal/HotelBookingFlow'
import { db } from '@/lib/db'
import { formatAdminHotel } from '@/lib/admin/hotels'
import { parseChildrenAges } from '@/lib/portal-routes'
import { buildPublicMetadata } from '@/lib/seo'

interface HotelBookingRouteProps {
  params: Promise<{
    hotelId: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getHotelData(hotelId: string) {
  const realCount = await db.hotel.count({
    where: { active: true, isTemplate: false },
  })
  const isTemplateQuery = realCount > 0 ? false : true

  const hotel = await db.hotel.findFirst({
    where: {
      OR: [
        { id: hotelId },
        { slug: hotelId },
      ],
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!hotel) return null
  return formatAdminHotel(hotel)
}

export async function generateMetadata({ params }: HotelBookingRouteProps): Promise<Metadata> {
  const { hotelId } = await params
  const hotel = await getHotelData(hotelId)

  if (!hotel) {
    return buildPublicMetadata({
      title: 'Reserva no disponible | WILROP',
      description: 'El hotel que intentas reservar no está disponible.',
      path: '/hoteles',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `Reserva en ${hotel.name} | WILROP`,
    description: `Completa tu reserva en ${hotel.name}, ${hotel.cityName}, desde el flujo de reserva seguro de WILROP.`,
    path: `/hoteles/${hotelId}/reserva`,
  })
}

export default async function HotelBookingRoutePage({ params, searchParams }: HotelBookingRouteProps) {
  const { hotelId } = await params
  const query = await searchParams
  const hotel = await getHotelData(hotelId)

  if (!hotel) {
    notFound()
  }

  const roomId = Array.isArray(query.roomId) ? query.roomId[0] : query.roomId

  if (!roomId || !hotel.rooms.some((room: any) => room.id === roomId)) {
    notFound()
  }

  const adultsValue = Array.isArray(query.adults) ? query.adults[0] : query.adults
  const childrenValue = Array.isArray(query.children) ? query.children[0] : query.children
  const checkIn = Array.isArray(query.checkIn) ? query.checkIn[0] : query.checkIn
  const checkOut = Array.isArray(query.checkOut) ? query.checkOut[0] : query.checkOut

  return (
    <PortalShell>
      <HotelBookingFlow
        hotelId={hotelId}
        roomId={roomId}
        checkIn={checkIn}
        checkOut={checkOut}
        adults={Number(adultsValue) || 1}
        childCount={Number(childrenValue) || 0}
        childrenAges={parseChildrenAges(query.childrenAges)}
        hotel={hotel}
      />
    </PortalShell>
  )
}
