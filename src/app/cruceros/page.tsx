import type { Metadata } from 'next'
import PortalShell from '@/components/portal/PortalShell'
import CruisesPage from '@/components/portal/CruisesPage'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Cruceros por el Caribe | WILROP',
  description: 'Compara y reserva los mejores cruceros zarpando desde Cartagena, San Andrés y otros puertos del Caribe colombiano con WILROP.',
  path: '/cruceros',
})

export default function PublicCruisesRoutePage() {
  return (
    <PortalShell>
      <CruisesPage />
    </PortalShell>
  )
}
