-- CreateTable
CREATE TABLE "Cruise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "shipName" TEXT NOT NULL DEFAULT '',
    "operator" TEXT NOT NULL DEFAULT '',
    "durationDays" INTEGER NOT NULL DEFAULT 3,
    "images" TEXT NOT NULL DEFAULT '[]',
    "includes" TEXT NOT NULL DEFAULT '[]',
    "itinerary" TEXT NOT NULL DEFAULT '[]',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "priceFrom" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT true,
    "primaryDestinationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cruise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CruiseCabin" (
    "id" TEXT NOT NULL,
    "cruiseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "beds" TEXT NOT NULL DEFAULT '2 camas individuales',
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "originalPrice" INTEGER NOT NULL DEFAULT 0,
    "includes" TEXT NOT NULL DEFAULT '[]',
    "cabinImage" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CruiseCabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationCruise" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "cruiseId" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationCruise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cruise_slug_key" ON "Cruise"("slug");

-- CreateIndex
CREATE INDEX "Cruise_primaryDestinationId_idx" ON "Cruise"("primaryDestinationId");

-- CreateIndex
CREATE INDEX "Cruise_active_isTemplate_idx" ON "Cruise"("active", "isTemplate");

-- CreateIndex
CREATE INDEX "Cruise_featured_active_idx" ON "Cruise"("featured", "active");

-- CreateIndex
CREATE INDEX "CruiseCabin_cruiseId_active_idx" ON "CruiseCabin"("cruiseId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCruise_destinationId_cruiseId_key" ON "DestinationCruise"("destinationId", "cruiseId");

-- CreateIndex
CREATE INDEX "DestinationCruise_destinationId_active_sortOrder_idx" ON "DestinationCruise"("destinationId", "active", "sortOrder");

-- CreateIndex
CREATE INDEX "DestinationCruise_cruiseId_idx" ON "DestinationCruise"("cruiseId");

-- AddForeignKey
ALTER TABLE "Cruise" ADD CONSTRAINT "Cruise_primaryDestinationId_fkey" FOREIGN KEY ("primaryDestinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CruiseCabin" ADD CONSTRAINT "CruiseCabin_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationCruise" ADD CONSTRAINT "DestinationCruise_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationCruise" ADD CONSTRAINT "DestinationCruise_cruiseId_fkey" FOREIGN KEY ("cruiseId") REFERENCES "Cruise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
