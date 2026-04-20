import PortalShell from '@/components/portal/PortalShell'
import RouteLoading from '@/components/portal/RouteLoading'

export default function HotelDetailLoading() {
  return (
    <PortalShell>
      <RouteLoading title="Cargando detalle del hotel..." />
    </PortalShell>
  )
}
