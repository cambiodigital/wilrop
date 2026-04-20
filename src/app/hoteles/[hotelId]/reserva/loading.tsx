import PortalShell from '@/components/portal/PortalShell'
import RouteLoading from '@/components/portal/RouteLoading'

export default function HotelBookingLoading() {
  return (
    <PortalShell>
      <RouteLoading title="Preparando el flujo de reserva del hotel..." />
    </PortalShell>
  )
}
