import PortalShell from '@/components/portal/PortalShell'
import TransportPage from '@/components/portal/TransportPage'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Servicios de Transporte | WILROP',
  description: 'Encuentra opciones de transporte turístico y traslados para tu viaje en Colombia.',
  path: '/transportes',
})

export default function TransportRoutePage() {
  return (
    <PortalShell>
      <TransportPage />
    </PortalShell>
  )
}