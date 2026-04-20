import PortalShell from '@/components/portal/PortalShell'
import ExcursionsPage from '@/components/portal/ExcursionsPage'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Excursiones y Tours | WILROP',
  description: 'Explora excursiones en Colombia para complementar tu viaje con experiencias locales inolvidables.',
  path: '/excursiones',
})

export default function ExcursionsRoutePage() {
  return (
    <PortalShell>
      <ExcursionsPage />
    </PortalShell>
  )
}