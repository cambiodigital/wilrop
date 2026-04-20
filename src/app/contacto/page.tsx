import PortalShell from '@/components/portal/PortalShell'
import ContactSection from '@/components/portal/ContactSection'
import { buildPublicMetadata } from '@/lib/seo'

export const metadata = buildPublicMetadata({
  title: 'Contacto | WILROP Colombia Travel',
  description: 'Habla con el equipo de WILROP para planear tu viaje y resolver dudas sobre reservas.',
  path: '/contacto',
})

export default function ContactRoutePage() {
  return (
    <PortalShell>
      <ContactSection />
    </PortalShell>
  )
}