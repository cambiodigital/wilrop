import DynamicPackager from '@/components/portal/DynamicPackager';
import PortalShell from '@/components/portal/PortalShell';
import { buildPublicMetadata } from '@/lib/seo';

export const metadata = buildPublicMetadata({
  title: 'Armar Paquete Terrestre | WILROP',
  description: 'Combina hotel, transporte y excursiones en un paquete terrestre receptivo para Colombia.',
  path: '/paquetes/armar',
});

export default function BuildPackagePage() {
  return (
    <PortalShell>
      <DynamicPackager />
    </PortalShell>
  );
}
