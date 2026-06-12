import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BrandLanding from "@/components/brand/BrandLanding";
import {
  getResellerCatalog,
  resolveCatalogPresentation,
} from "@/lib/reseller/catalog";
import {
  applyCatalogOverrides,
  getCatalogOverridesMap,
} from "@/lib/reseller/public-overrides";

export const dynamic = "force-dynamic";

interface BrandPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * White-label landing page.
 * The middleware rewrites custom domain / subdomain requests here
 * with _domain or _subdomain search params.
 */
export default async function BrandPage({ searchParams }: BrandPageProps) {
  const params = await searchParams;
  const domain = getFirst(params._domain);
  const subdomain = getFirst(params._subdomain);

  if (!domain && !subdomain) {
    notFound();
  }

  // Resolve the reseller
  const reseller = await db.reseller.findFirst({
    where: {
      ...(domain ? { customDomain: domain } : {}),
      ...(subdomain ? { subdomain } : {}),
      active: true,
      whiteLabelEnabled: true,
      approvalStatus: "approved",
    },
    include: {
      catalogs: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
      hotels: {
        where: { active: true, isTemplate: false },
        take: 20,
      },
      packages: {
        where: { active: true, isTemplate: false },
        take: 20,
      },
      excursions: {
        where: { active: true, isTemplate: false },
        take: 20,
      },
      cruises: {
        where: { active: true, isTemplate: false },
        take: 20,
      },
      transportServices: {
        where: { active: true, isTemplate: false },
        take: 20,
      },
    },
  });

  if (!reseller) {
    notFound();
  }

  const [
    catalogItems,
    hotelOverrides,
    packageOverrides,
    excursionOverrides,
    cruiseOverrides,
    transportOverrides,
  ] = await Promise.all([
    getResellerCatalog(reseller.id, { active: true }),
    getCatalogOverridesMap(reseller.id, "hotel"),
    getCatalogOverridesMap(reseller.id, "package"),
    getCatalogOverridesMap(reseller.id, "excursion"),
    getCatalogOverridesMap(reseller.id, "cruise"),
    getCatalogOverridesMap(reseller.id, "transport"),
  ]);

  // Load catalog-linked products (templates selected by the reseller)
  const catalogHotelIds = reseller.catalogs
    .filter((c) => c.sourceType === "hotel")
    .map((c) => c.sourceId);
  const catalogPackageIds = reseller.catalogs
    .filter((c) => c.sourceType === "package")
    .map((c) => c.sourceId);
  const catalogExcursionIds = reseller.catalogs
    .filter((c) => c.sourceType === "excursion")
    .map((c) => c.sourceId);

  const [catalogHotels, catalogPackages, catalogExcursions] = await Promise.all(
    [
      catalogHotelIds.length > 0
        ? db.hotel.findMany({
            where: {
              id: { in: catalogHotelIds },
              active: true,
              isTemplate: true,
            },
          })
        : Promise.resolve([]),
      catalogPackageIds.length > 0
        ? db.travelPackage.findMany({
            where: {
              id: { in: catalogPackageIds },
              active: true,
              isTemplate: true,
            },
          })
        : Promise.resolve([]),
      catalogExcursionIds.length > 0
        ? db.excursion.findMany({
            where: { id: { in: catalogExcursionIds }, active: true },
          })
        : Promise.resolve([]),
    ],
  );

  // Merge: reseller's own products + catalog templates
  const allHotels = [...reseller.hotels, ...catalogHotels].map((item) =>
    applyCatalogOverrides("hotel", item, hotelOverrides.get(item.id)),
  );
  const allPackages = [...reseller.packages, ...catalogPackages].map((item) =>
    applyCatalogOverrides("package", item, packageOverrides.get(item.id)),
  );
  const allExcursions = [...reseller.excursions, ...catalogExcursions].map(
    (item) =>
      applyCatalogOverrides("excursion", item, excursionOverrides.get(item.id)),
  );
  const allTransport = reseller.transportServices.map((item) =>
    applyCatalogOverrides("transport", item, transportOverrides.get(item.id)),
  );
  const allCruises = reseller.cruises.map((item) =>
    applyCatalogOverrides("cruise", item, cruiseOverrides.get(item.id)),
  );

  const catalogDestinationMap = new Map(
    catalogItems
      .map(resolveCatalogPresentation)
      .filter((item) => item.sourceType === "destination")
      .map((item) => [item.sourceId, item]),
  );

  // Destinations that contain at least one of these products
  const destinationIds = new Set<string>();
  for (const h of allHotels) {
    if (h.destinationId) destinationIds.add(h.destinationId);
  }
  for (const p of allPackages) {
    if (p.primaryDestinationId) destinationIds.add(p.primaryDestinationId);
  }
  for (const e of allExcursions) {
    if (e.destinationRefId) destinationIds.add(e.destinationRefId);
    else if (e.destinationId) destinationIds.add(e.destinationId);
  }

  const destinations =
    destinationIds.size > 0
      ? await db.destination.findMany({
          where: { id: { in: [...destinationIds] }, active: true },
          orderBy: { order: "asc" },
        })
      : [];

  return (
    <BrandLanding
      reseller={{
        id: reseller.id,
        companyName: reseller.companyName,
        logoUrl: reseller.logoUrl,
      }}
      hotels={allHotels}
      packages={allPackages}
      excursions={allExcursions}
      cruises={allCruises}
      transportServices={allTransport}
      destinations={destinations.map((destination) => {
        const override = catalogDestinationMap.get(destination.id);

        return {
          ...destination,
          name: override?.title || destination.name,
          description: override?.description || destination.description,
        };
      })}
    />
  );
}
