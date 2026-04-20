import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import BookingFlow from '@/components/portal/BookingFlow'
import { getPackageById } from '@/data/packages'
import { buildPublicMetadata } from '@/lib/seo'

interface PackageBookingRouteProps {
  params: Promise<{
    packageId: string
  }>
}

export async function generateMetadata({ params }: PackageBookingRouteProps): Promise<Metadata> {
  const { packageId } = await params
  const travelPackage = getPackageById(packageId)

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
  const travelPackage = getPackageById(packageId)

  if (!travelPackage) {
    notFound()
  }

  return (
    <PortalShell>
      <BookingFlow packageId={packageId} />
    </PortalShell>
  )
}