import PortalShell from '@/components/portal/PortalShell'
import AboutSection from '@/components/portal/AboutSection'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Sobre Nosotros | WILROP',
  description: 'Conoce la historia y el enfoque de WILROP para crear experiencias de viaje en Colombia.',
  path: '/sobre-nosotros',
})

export default function AboutRoutePage() {
  return (
    <PortalShell>
      <AboutSection />
    </PortalShell>
  )
}