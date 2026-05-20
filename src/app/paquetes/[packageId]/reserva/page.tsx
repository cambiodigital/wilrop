import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import BookingFlow from '@/components/portal/BookingFlow'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

interface PackageBookingRouteProps {
  params: Promise<{
    packageId: string
  }>
}

async function getPackageData(packageId: string) {
  const realCount = await db.travelPackage.count({
    where: { active: true, isTemplate: false },
  })
  const isTemplateQuery = realCount > 0 ? false : true

  const travelPackage = await db.travelPackage.findFirst({
    where: {
      id: packageId,
      active: true,
      isTemplate: isTemplateQuery,
    },
  })

  if (!travelPackage) return null

  return {
    ...travelPackage,
    includes: (() => {
      try {
        return JSON.parse(travelPackage.includes || '[]') as string[]
      } catch {
        return []
      }
    })(),
    departureDates: (() => {
      try {
        return JSON.parse(travelPackage.departureDates || '[]') as string[]
      } catch {
        return []
      }
    })(),
  }
}

export async function generateMetadata({ params }: PackageBookingRouteProps): Promise<Metadata> {
  const { packageId } = await params
  const travelPackage = await getPackageData(packageId)

  if (!travelPackage) {
    return buildPublicMetadata({
      title: 'Reserva no disponible | WILROP',
      description: 'El paquete que intentas reservar no está disponible.',
      path: '/destinos',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `Reserva ${travelPackage.title} | WILROP`,
    description: `Completa tu reserva del paquete ${travelPackage.title} en ${travelPackage.destinationName}.`,
    path: `/paquetes/${packageId}/reserva`,
  })
}

export default async function PackageBookingRoutePage({ params }: PackageBookingRouteProps) {
  const { packageId } = await params
  const travelPackage = await getPackageData(packageId)

  if (!travelPackage) {
    notFound()
  }

  return (
    <PortalShell>
      <BookingFlow packageId={packageId} pkg={travelPackage} />
    </PortalShell>
  )
}