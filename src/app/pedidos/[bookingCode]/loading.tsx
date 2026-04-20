import PortalShell from '@/components/portal/PortalShell'
import RouteLoading from '@/components/portal/RouteLoading'

export default function OrderDetailLoading() {
  return (
    <PortalShell>
      <RouteLoading title="Cargando el detalle del pedido..." />
    </PortalShell>
  )
}
