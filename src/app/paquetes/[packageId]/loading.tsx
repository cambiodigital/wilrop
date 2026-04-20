import PortalShell from '@/components/portal/PortalShell'
import RouteLoading from '@/components/portal/RouteLoading'

export default function PackageDetailLoading() {
  return (
    <PortalShell>
      <RouteLoading title="Cargando detalle del paquete..." />
    </PortalShell>
  )
}
