import PortalShell from '@/components/portal/PortalShell'
import DestinationsSection from '@/components/portal/DestinationsSection'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Destinos en Colombia | WILROP',
  description: 'Descubre destinos turísticos en Colombia y encuentra el viaje ideal para tu próxima aventura.',
  path: '/destinos',
})

export default function DestinationsPage() {
  return (
    <PortalShell>
      <DestinationsSection />
    </PortalShell>
  )
}