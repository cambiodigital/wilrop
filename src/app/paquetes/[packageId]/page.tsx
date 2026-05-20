import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs'
import PackageDetail from '@/components/portal/PackageDetail'
import { db } from '@/lib/db'
import { buildPublicMetadata } from '@/lib/seo'

interface PackageDetailRouteProps {
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

  const parsedPackage = {
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

  // Get related packages
  const rawRelated = await db.travelPackage.findMany({
    where: {
      destinationId: travelPackage.destinationId,
      id: { not: travelPackage.id },
      active: true,
      isTemplate: isTemplateQuery,
    },
    take: 4,
  })

  const relatedPackages = rawRelated.map((pkg) => ({
    ...pkg,
    includes: (() => {
      try {
        return JSON.parse(pkg.includes || '[]') as string[]
      } catch {
        return []
      }
    })(),
    departureDates: (() => {
      try {
        return JSON.parse(pkg.departureDates || '[]') as string[]
      } catch {
        return []
      }
    })(),
  }))

  return {
    travelPackage: parsedPackage,
    relatedPackages,
  }
}

export async function generateMetadata({ params }: PackageDetailRouteProps): Promise<Metadata> {
  const { packageId } = await params
  const data = await getPackageData(packageId)

  if (!data) {
    return buildPublicMetadata({
      title: 'Paquete no encontrado | WILROP',
      description: 'El paquete solicitado no existe o no está disponible en este momento.',
      path: '/destinos',
      noIndex: true,
    })
  }

  const { travelPackage } = data

  return buildPublicMetadata({
    title: `${travelPackage.title} | WILROP`,
    description: `Conoce el paquete ${travelPackage.title} en ${travelPackage.destinationName} y reserva en línea.`,
    path: `/paquetes/${packageId}`,
    ogImage: travelPackage.image,
  })
}

export default async function PackageDetailRoutePage({ params }: PackageDetailRouteProps) {
  const { packageId } = await params
  const data = await getPackageData(packageId)

  if (!data) {
    notFound()
  }

  const { travelPackage, relatedPackages } = data

  return (
    <PortalShell>
      <div className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-4 sm:px-6 lg:px-8">
          <PortalBreadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Destinos', href: '/destinos' },
              { label: travelPackage.title },
            ]}
          />
        </div>
      </div>
      <PackageDetail packageId={packageId} pkg={travelPackage} relatedPackages={relatedPackages} />
    </PortalShell>
  )
}
