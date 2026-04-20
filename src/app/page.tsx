import { redirect } from 'next/navigation'
import PortalShell from '@/components/portal/PortalShell'
import PublicPortalHome from '@/components/portal/PublicPortalHome'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'WILROP Colombia Travel | Viajes por Colombia',
  description: 'Explora destinos, hoteles y paquetes en Colombia con rutas claras y experiencia de reserva simple.',
  path: '/',
})

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function resolveLegacyView(view: string): string | null {
  if (view === 'admin-login') return '/admin/login'
  if (view.startsWith('admin-')) {
    if (view === 'admin-destinations') return '/admin/destinos'
    if (view === 'admin-hotels') return '/admin/hoteles'
    if (view === 'admin-packages') return '/admin/paquetes'
    if (view === 'admin-bookings') return '/admin/reservas'
    if (view === 'admin-allotments') return '/admin/habitaciones'
    if (view === 'admin-excursions') return '/admin/excursiones'
    if (view === 'admin-transport') return '/admin/transportes'
    if (view === 'admin-subagents') return '/admin/subagentes'
    if (view === 'admin-marketing') return '/admin/marketing-modal'
    return '/admin'
  }

  if (view === 'reseller-login') return '/reseller/login'
  if (view.startsWith('reseller-')) {
    if (view === 'reseller-sales') return '/reseller/ventas'
    if (view === 'reseller-commissions') return '/reseller/comisiones'
    if (view === 'reseller-clients') return '/reseller/clientes'
    if (view === 'reseller-whitelabel') return '/reseller/whitelabel'
    if (view === 'reseller-whitelabel-preview') return '/reseller/whitelabel/preview'
    return '/reseller'
  }

  if (view === 'subagent-login') return '/subagent/login'
  if (view.startsWith('subagent-')) {
    if (view === 'subagent-sales') return '/subagent/ventas'
    if (view === 'subagent-commissions') return '/subagent/comisiones'
    if (view === 'subagent-clients') return '/subagent/clientes'
    return '/subagent'
  }

  return null
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams
  const view = getFirstValue(query.view)

  if (view) {
    const target = resolveLegacyView(view)
    if (target) {
      redirect(target)
    }
  }

  return (
    <PortalShell>
      <PublicPortalHome />
    </PortalShell>
  )
}
