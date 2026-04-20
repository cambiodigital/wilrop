import PortalShell from '@/components/portal/PortalShell'
import RouteLoading from '@/components/portal/RouteLoading'

export default function PackageBookingLoading() {
  return (
    <PortalShell>
      <RouteLoading title="Preparando el flujo de reserva del paquete..." />
    </PortalShell>
  )
}
