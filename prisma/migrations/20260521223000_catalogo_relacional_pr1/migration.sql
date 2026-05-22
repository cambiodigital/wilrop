-- PR1 catalogo-relacional-turistico: additive relational catalog spine.
-- No legacy fields are dropped or renamed. Rollback for this PR is to drop the
-- tables, constraints, indexes, and nullable columns created in this file only.

-- Add nullable bridge references to existing catalog tables.
ALTER TABLE "Hotel" ADD COLUMN "destinationId" TEXT;
ALTER TABLE "TravelPackage" ADD COLUMN "primaryDestinationId" TEXT;
ALTER TABLE "Excursion" ADD COLUMN "destinationRefId" TEXT;
ALTER TABLE "TransportService" ADD COLUMN "originDestinationId" TEXT;
ALTER TABLE "TransportService" ADD COLUMN "destinationDestinationId" TEXT;

-- Destination/product joins.
CREATE TABLE "DestinationHotel" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DestinationHotel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DestinationPackage" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DestinationPackage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DestinationExcursion" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "excursionId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DestinationExcursion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DestinationTransportService" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "transportServiceId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DestinationTransportService_pkey" PRIMARY KEY ("id")
);

-- Package composition joins and additive normalized children.
CREATE TABLE "PackageHotel" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'lodging',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageHotel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageExcursion" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "excursionId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageExcursion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageTransportService" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "transportServiceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'transfer',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageTransportService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageRoomType" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageRoomType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageDepartureDate" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3),
    "availableSeats" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageDepartureDate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageItineraryDay" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "activities" TEXT NOT NULL DEFAULT '[]',
    "meals" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageItineraryDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackageIncludedService" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'general',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackageIncludedService_pkey" PRIMARY KEY ("id")
);

-- Existing table indexes for selector/filter readiness.
CREATE INDEX "Destination_active_isTemplate_idx" ON "Destination"("active", "isTemplate");
CREATE INDEX "Destination_order_idx" ON "Destination"("order");
CREATE INDEX "Hotel_destinationId_idx" ON "Hotel"("destinationId");
CREATE INDEX "Hotel_active_isTemplate_idx" ON "Hotel"("active", "isTemplate");
CREATE INDEX "Hotel_featured_active_idx" ON "Hotel"("featured", "active");
CREATE INDEX "RoomType_hotelId_active_idx" ON "RoomType"("hotelId", "active");
CREATE INDEX "TravelPackage_primaryDestinationId_idx" ON "TravelPackage"("primaryDestinationId");
CREATE INDEX "TravelPackage_destinationId_idx" ON "TravelPackage"("destinationId");
CREATE INDEX "TravelPackage_active_isTemplate_idx" ON "TravelPackage"("active", "isTemplate");
CREATE INDEX "TravelPackage_category_active_idx" ON "TravelPackage"("category", "active");
CREATE INDEX "Excursion_destinationRefId_idx" ON "Excursion"("destinationRefId");
CREATE INDEX "Excursion_destinationId_idx" ON "Excursion"("destinationId");
CREATE INDEX "Excursion_active_isTemplate_idx" ON "Excursion"("active", "isTemplate");
CREATE INDEX "Excursion_category_active_idx" ON "Excursion"("category", "active");
CREATE INDEX "Excursion_featured_active_idx" ON "Excursion"("featured", "active");
CREATE INDEX "TransportService_providerId_idx" ON "TransportService"("providerId");
CREATE INDEX "TransportService_originDestinationId_idx" ON "TransportService"("originDestinationId");
CREATE INDEX "TransportService_destinationDestinationId_idx" ON "TransportService"("destinationDestinationId");
CREATE INDEX "TransportService_cityId_idx" ON "TransportService"("cityId");
CREATE INDEX "TransportService_active_isTemplate_idx" ON "TransportService"("active", "isTemplate");

-- Relation table uniqueness and indexes.
CREATE UNIQUE INDEX "DestinationHotel_destinationId_hotelId_key" ON "DestinationHotel"("destinationId", "hotelId");
CREATE INDEX "DestinationHotel_destinationId_active_sortOrder_idx" ON "DestinationHotel"("destinationId", "active", "sortOrder");
CREATE INDEX "DestinationHotel_hotelId_idx" ON "DestinationHotel"("hotelId");
CREATE UNIQUE INDEX "DestinationPackage_destinationId_packageId_key" ON "DestinationPackage"("destinationId", "packageId");
CREATE INDEX "DestinationPackage_destinationId_active_sortOrder_idx" ON "DestinationPackage"("destinationId", "active", "sortOrder");
CREATE INDEX "DestinationPackage_packageId_idx" ON "DestinationPackage"("packageId");
CREATE UNIQUE INDEX "DestinationExcursion_destinationId_excursionId_key" ON "DestinationExcursion"("destinationId", "excursionId");
CREATE INDEX "DestinationExcursion_destinationId_active_sortOrder_idx" ON "DestinationExcursion"("destinationId", "active", "sortOrder");
CREATE INDEX "DestinationExcursion_excursionId_idx" ON "DestinationExcursion"("excursionId");
CREATE UNIQUE INDEX "DestinationTransportService_destinationId_transportServiceId_key" ON "DestinationTransportService"("destinationId", "transportServiceId");
CREATE INDEX "DestinationTransportService_destinationId_active_sortOrder_idx" ON "DestinationTransportService"("destinationId", "active", "sortOrder");
CREATE INDEX "DestinationTransportService_transportServiceId_idx" ON "DestinationTransportService"("transportServiceId");
CREATE UNIQUE INDEX "PackageHotel_packageId_hotelId_role_key" ON "PackageHotel"("packageId", "hotelId", "role");
CREATE INDEX "PackageHotel_packageId_active_sortOrder_idx" ON "PackageHotel"("packageId", "active", "sortOrder");
CREATE INDEX "PackageHotel_hotelId_idx" ON "PackageHotel"("hotelId");
CREATE UNIQUE INDEX "PackageExcursion_packageId_excursionId_key" ON "PackageExcursion"("packageId", "excursionId");
CREATE INDEX "PackageExcursion_packageId_active_sortOrder_idx" ON "PackageExcursion"("packageId", "active", "sortOrder");
CREATE INDEX "PackageExcursion_excursionId_idx" ON "PackageExcursion"("excursionId");
CREATE UNIQUE INDEX "PackageTransportService_packageId_transportServiceId_role_key" ON "PackageTransportService"("packageId", "transportServiceId", "role");
CREATE INDEX "PackageTransportService_packageId_active_sortOrder_idx" ON "PackageTransportService"("packageId", "active", "sortOrder");
CREATE INDEX "PackageTransportService_transportServiceId_idx" ON "PackageTransportService"("transportServiceId");
CREATE UNIQUE INDEX "PackageRoomType_packageId_roomTypeId_key" ON "PackageRoomType"("packageId", "roomTypeId");
CREATE INDEX "PackageRoomType_packageId_active_sortOrder_idx" ON "PackageRoomType"("packageId", "active", "sortOrder");
CREATE INDEX "PackageRoomType_roomTypeId_idx" ON "PackageRoomType"("roomTypeId");
CREATE UNIQUE INDEX "PackageDepartureDate_packageId_dateFrom_key" ON "PackageDepartureDate"("packageId", "dateFrom");
CREATE INDEX "PackageDepartureDate_packageId_active_dateFrom_idx" ON "PackageDepartureDate"("packageId", "active", "dateFrom");
CREATE UNIQUE INDEX "PackageItineraryDay_packageId_day_key" ON "PackageItineraryDay"("packageId", "day");
CREATE INDEX "PackageItineraryDay_packageId_day_idx" ON "PackageItineraryDay"("packageId", "day");
CREATE UNIQUE INDEX "PackageIncludedService_packageId_serviceType_name_key" ON "PackageIncludedService"("packageId", "serviceType", "name");
CREATE INDEX "PackageIncludedService_packageId_active_sortOrder_idx" ON "PackageIncludedService"("packageId", "active", "sortOrder");

-- Nullable FK constraints. Joins cascade; optional bridge refs SetNull.
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TravelPackage" ADD CONSTRAINT "TravelPackage_primaryDestinationId_fkey" FOREIGN KEY ("primaryDestinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Excursion" ADD CONSTRAINT "Excursion_destinationRefId_fkey" FOREIGN KEY ("destinationRefId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_originDestinationId_fkey" FOREIGN KEY ("originDestinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_destinationDestinationId_fkey" FOREIGN KEY ("destinationDestinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DestinationHotel" ADD CONSTRAINT "DestinationHotel_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationHotel" ADD CONSTRAINT "DestinationHotel_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationPackage" ADD CONSTRAINT "DestinationPackage_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationPackage" ADD CONSTRAINT "DestinationPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationExcursion" ADD CONSTRAINT "DestinationExcursion_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationExcursion" ADD CONSTRAINT "DestinationExcursion_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationTransportService" ADD CONSTRAINT "DestinationTransportService_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DestinationTransportService" ADD CONSTRAINT "DestinationTransportService_transportServiceId_fkey" FOREIGN KEY ("transportServiceId") REFERENCES "TransportService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageHotel" ADD CONSTRAINT "PackageHotel_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageHotel" ADD CONSTRAINT "PackageHotel_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageExcursion" ADD CONSTRAINT "PackageExcursion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageExcursion" ADD CONSTRAINT "PackageExcursion_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageTransportService" ADD CONSTRAINT "PackageTransportService_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageTransportService" ADD CONSTRAINT "PackageTransportService_transportServiceId_fkey" FOREIGN KEY ("transportServiceId") REFERENCES "TransportService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageRoomType" ADD CONSTRAINT "PackageRoomType_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageRoomType" ADD CONSTRAINT "PackageRoomType_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageDepartureDate" ADD CONSTRAINT "PackageDepartureDate_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageItineraryDay" ADD CONSTRAINT "PackageItineraryDay_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackageIncludedService" ADD CONSTRAINT "PackageIncludedService_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TravelPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
