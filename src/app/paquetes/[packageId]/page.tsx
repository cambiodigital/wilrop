import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs'
import PackageDetail from '@/components/portal/PackageDetail'
import { getPackageById } from '@/data/packages'
import { buildPublicMetadata } from '@/lib/seo'

interface PackageDetailRouteProps {
  params: Promise<{
    packageId: string
  }>
}

export async function generateMetadata({ params }: PackageDetailRouteProps): Promise<Metadata> {
  const { packageId } = await params
  const travelPackage = getPackageById(packageId)

  if (!travelPackage) {
    return buildPublicMetadata({
      title: 'Paquete no encontrado | WILROP',
      description: 'El paquete solicitado no existe o no está disponible en este momento.',
      path: '/destinos',
      noIndex: true,
    })
  }

  return buildPublicMetadata({
    title: `${travelPackage.title} | WILROP`,
    description: `Conoce el paquete ${travelPackage.title} en ${travelPackage.destinationName} y reserva en línea.`,
    path: `/paquetes/${packageId}`,
    ogImage: travelPackage.image,
  })
}

export default async function PackageDetailRoutePage({ params }: PackageDetailRouteProps) {
  const { packageId } = await params
  const travelPackage = getPackageById(packageId)

  if (!travelPackage) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <PortalBreadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Destinos', href: '/destinos' },
            { label: travelPackage.title },
          ]}
        />
      </div>
      <PackageDetail packageId={packageId} />
    </PortalShell>
  )
}