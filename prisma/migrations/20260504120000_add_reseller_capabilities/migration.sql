CREATE TABLE IF NOT EXISTS "Excursion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "duration" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT 'Fácil',
    "groupSize" TEXT NOT NULL DEFAULT '',
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "childPrice" INTEGER NOT NULL DEFAULT 0,
    "includes" TEXT NOT NULL DEFAULT '[]',
    "excludes" TEXT NOT NULL DEFAULT '[]',
    "requirements" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL DEFAULT '',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Excursion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Excursion_slug_key" ON "Excursion"("slug");

CREATE TABLE IF NOT EXISTS "Subagent" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL DEFAULT '',
    "contactName" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "commission" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subagent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subagent_code_key" ON "Subagent"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Subagent_email_key" ON "Subagent"("email");

CREATE TABLE IF NOT EXISTS "TransportProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL DEFAULT '',
    "nit" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "vehicleType" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportProvider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TransportService" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "routeType" TEXT NOT NULL DEFAULT '',
    "origin" TEXT NOT NULL DEFAULT '',
    "destination" TEXT NOT NULL DEFAULT '',
    "cityId" TEXT NOT NULL DEFAULT '',
    "cityName" TEXT NOT NULL DEFAULT '',
    "durationMins" INTEGER NOT NULL DEFAULT 0,
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "pricePerExtra" INTEGER NOT NULL DEFAULT 0,
    "includes" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportService_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF to_regclass('public."Booking"') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM pg_constraint
           WHERE conname = 'Booking_subagentId_fkey'
       )
    THEN
        ALTER TABLE "Booking" ADD CONSTRAINT "Booking_subagentId_fkey"
        FOREIGN KEY ("subagentId") REFERENCES "Subagent"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'TransportService_providerId_fkey'
    )
    THEN
        ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "TransportProvider"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "sellerLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false;
