import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortalShell from '@/components/portal/PortalShell';
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs';
import PackageDetail from '@/components/portal/PackageDetail';
import { buildPublicMetadata } from '@/lib/seo';
import { getPackageData } from '@/lib/catalog/packages';

interface PackageDetailRouteProps {
  params: Promise<{
    packageId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PackageDetailRouteProps): Promise<Metadata> {
  const { packageId } = await params;
  const data = await getPackageData(packageId);

  if (!data) {
    return buildPublicMetadata({
      title: 'Paquete no encontrado | WILROP',
      description:
        'El paquete solicitado no existe o no está disponible en este momento.',
      path: '/destinos',
      noIndex: true,
    });
  }

  const { travelPackage } = data;

  return buildPublicMetadata({
    title: `${travelPackage.title} | WILROP`,
    description: `Conoce el paquete ${travelPackage.title} en ${travelPackage.destinationName} y reserva en línea.`,
    path: `/paquetes/${packageId}`,
    ogImage: travelPackage.image,
  });
}

export default async function PackageDetailRoutePage({
  params,
}: PackageDetailRouteProps) {
  const { packageId } = await params;
  const data = await getPackageData(packageId);

  if (!data) {
    notFound();
  }

  const { travelPackage, relatedPackages } = data;

  return (
    <PortalShell>
      <div className="w-full bg-neutral-50/90 border-b border-neutral-200/50 backdrop-blur-xs pt-16 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <PortalBreadcrumbs
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Destinos', href: '/destinos' },
              { label: travelPackage.title },
            ]}
          />
        </div>
      </div>
      <PackageDetail
        packageId={packageId}
        pkg={travelPackage}
        relatedPackages={relatedPackages}
      />
    </PortalShell>
  );
}
