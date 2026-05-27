import { Suspense } from 'react'
import PortalShell from '@/components/portal/PortalShell'
import DestinationsSection from '@/components/portal/DestinationsSection'
import RouteLoading from '@/components/portal/RouteLoading'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Destinos en Colombia | WILROP',
  description: 'Descubre destinos turísticos en Colombia y encuentra el viaje ideal para tu próxima aventura.',
  path: '/destinos',
})

export default function DestinationsPage() {
  return (
    <PortalShell>
      <Suspense fallback={<RouteLoading />}>
        <DestinationsSection />
      </Suspense>
    </PortalShell>
  )
}