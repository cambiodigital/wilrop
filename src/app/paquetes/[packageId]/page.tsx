import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortalShell from '@/components/portal/PortalShell';
import PortalBreadcrumbs from '@/components/portal/PortalBreadcrumbs';
import PackageDetail from '@/components/portal/PackageDetail';
import { db } from '@/lib/db';
import { buildPublicMetadata } from '@/lib/seo';
import {
  normalizePackage,
  resolveIsTemplateFallback,
  parseJsonArray,
} from '@/lib/catalog/public-hydration';

interface PackageDetailRouteProps {
  params: Promise<{
    packageId: string;
  }>;
}

async function getPackageData(packageId: string) {
  const realCount = await db.travelPackage.count({
    where: { active: true, isTemplate: false },
  });
  const isTemplateFallback = resolveIsTemplateFallback(realCount);

  // --- Primary package query ---
  const travelPackage = await db.travelPackage.findFirst({
    where: {
      id: packageId,
      active: true,
      isTemplate: isTemplateFallback,
    },
  });

  if (!travelPackage) return null;

  // Normalize core package fields
  const normalized = normalizePackage(
    travelPackage as Record<string, unknown>,
  );

  // --- Hydrate package composition from relational joins ---
  const [
    packageHotels,
    packageExcursions,
    packageTransports,
    packageRoomTypes,
    departureDates,
    includedServices,
    destinationPackages,
  ] = await Promise.all([
    db.packageHotel.findMany({
      where: { packageId, active: true },
      include: { hotel: true },
      orderBy: { sortOrder: 'asc' },
    }),
    db.packageExcursion.findMany({
      where: { packageId, active: true },
      include: { excursion: true },
      orderBy: { sortOrder: 'asc' },
    }),
    db.packageTransportService.findMany({
      where: { packageId, active: true },
      include: {
        transportService: {
          include: {
            provider: {
              select: { name: true, vehicleType: true, capacity: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    db.packageRoomType.findMany({
      where: { packageId, active: true },
      include: { roomType: true },
      orderBy: { sortOrder: 'asc' },
    }),
    db.packageDepartureDate
      .findMany({
        where: { packageId, active: true },
        orderBy: { dateFrom: 'asc' },
      })
      .catch(() => [] as any[]),
    db.packageIncludedService
      .findMany({
        where: { packageId, active: true },
        orderBy: { sortOrder: 'asc' },
      })
      .catch(() => [] as any[]),
    db.destinationPackage.findMany({
      where: { packageId, active: true },
      include: { destination: true },
    }),
  ]);

  // --- Hydrate departureDates: use relational model if rows exist, JSON fallback otherwise ---
  const resolvedDepartureDates =
    departureDates && departureDates.length > 0
      ? departureDates.map((dd: any) => dd.dateFrom?.toISOString?.() ?? dd.dateFrom)
      : parseJsonArray<string>(
          (travelPackage as any).departureDates ?? '[]',
        );

  // --- Hydrate includes: use relational model if rows exist, JSON fallback otherwise ---
  const resolvedIncludes =
    includedServices && includedServices.length > 0
      ? includedServices.map((s: any) => s.name)
      : normalized.includes;

  // --- Resolve destination(s) from DestinationPackage join ---
  const destinations = destinationPackages.map((dp) => dp.destination);
  const primaryDestination = destinations[0] ?? null;

  // --- Related packages: find packages sharing a destination via DestinationPackage ---
  let relatedPackageIds: string[] = [];
  if (destinations.length > 0) {
    const destIds = destinations.map((d) => d.id);
    const siblingJoins = await db.destinationPackage.findMany({
      where: {
        destinationId: { in: destIds },
        packageId: { not: packageId },
        active: true,
        package: { active: true, isTemplate: isTemplateFallback },
      },
      select: { packageId: true },
      distinct: ['packageId'],
      take: 15, // get more than needed, then limit after fetch
    });
    relatedPackageIds = siblingJoins.map((j) => j.packageId);
  }

  // Fallback: use primaryDestinationId FK if no DestinationPackage join results
  if (relatedPackageIds.length === 0 && travelPackage.primaryDestinationId) {
    const fkRelated = await db.travelPackage.findMany({
      where: {
        primaryDestinationId: travelPackage.primaryDestinationId,
        id: { not: packageId },
        active: true,
        isTemplate: isTemplateFallback,
      },
      select: { id: true },
      take: 15,
    });
    relatedPackageIds = fkRelated.map((p) => p.id);
  }

  // Fetch related package full rows
  const rawRelated =
    relatedPackageIds.length > 0
      ? await db.travelPackage.findMany({
          where: { id: { in: relatedPackageIds.slice(0, 8) } },
          take: 4,
        })
      : [];

  const relatedPackages = rawRelated.map((pkg) => ({
    ...normalizePackage(pkg as Record<string, unknown>),
  }));

  // --- Build enriched package object for the component ---
  const enrichedPackage = {
    ...normalized,
    // Fields from the raw model not in NormalizedPackage (needed by PackageDetail)
    destinationId: travelPackage.destinationId,
    destinationName: travelPackage.destinationName,
    includes: resolvedIncludes,
    departureDates: resolvedDepartureDates,
    // Composition from joins
    hotels: packageHotels.map((ph) => ph.hotel),
    excursions: packageExcursions.map((pe) => pe.excursion),
    transportServices: packageTransports.map((pt) => ({
      ...pt.transportService,
      role: pt.role,
      provider: (pt.transportService as any).provider ?? null,
    })),
    roomTypes: packageRoomTypes.map((pr) => pr.roomType),
    destinations,
    primaryDestination,
    // Keep legacy includes/departureDates as raw for any fallback consumers
    _rawIncludes: (travelPackage as any).includes,
    _rawDepartureDates: (travelPackage as any).departureDates,
  };

  return {
    travelPackage: enrichedPackage,
    relatedPackages,
  };
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
