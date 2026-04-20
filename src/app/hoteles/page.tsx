import PortalShell from '@/components/portal/PortalShell'
import HotelsPage from '@/components/portal/HotelsPage'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Hoteles en Colombia | WILROP',
  description: 'Compara hoteles en Colombia y reserva alojamiento según tu destino, fechas y presupuesto.',
  path: '/hoteles',
})

export default function HotelsRoutePage() {
  return (
    <PortalShell>
      <HotelsPage />
    </PortalShell>
  )
}