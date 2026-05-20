import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs'
import HotelDetailPage from '@/components/portal/HotelDetailPage'
import { db } from '@/lib/db'
import { formatAdminHotel } from '@/lib/admin/hotels'
import { buildPublicMetadata } from '@/lib/seo'

interface HotelDetailRouteProps {
  params: Promise<{
    hotelId: string
  }>
}

async function getHotelData(hotelId: string) {
  const realCount = await db.hotel.count({
    where: { active: true, isTemplate: false },
  })
  const isTemplateQuery = realCount > 0 ? false : true

  const hotel = await db.hotel.findFirst({
    where: {
      id: hotelId,
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!hotel) return null
  return formatAdminHotel(hotel)
}

export async function generateMetadata({ params }: HotelDetailRouteProps): Promise<Metadata> {
  const { hotelId } = await params
  const hotel = await getHotelData(hotelId)

  if (!hotel) {
    return buildPublicMetadata({
      title: 'Hotel no encontrado | WILROP',
      description: 'El hotel solicitado no existe o ya no está disponible.',
      path: '/hoteles',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `${hotel.name} | Hoteles WILROP`,
    description: `Revisa detalles de ${hotel.name} en ${hotel.cityName} y reserva tu estadía con WILROP.`,
    path: `/hoteles/${hotelId}`,
    ogImage: hotel.images[0],
  })
}

export default async function HotelDetailRoutePage({ params }: HotelDetailRouteProps) {
  const { hotelId } = await params
  const hotel = await getHotelData(hotelId)

  if (!hotel) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-5xl px-5 pt-20 sm:px-6">
        <PortalBreadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Hoteles', href: '/hoteles' },
            { label: hotel.name },
          ]}
        />
      </div>
      <HotelDetailPage hotel={hotel as any} />
    </PortalShell>
  )
}