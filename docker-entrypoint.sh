#!/bin/sh
# docker-entrypoint.sh - runs when the container starts
set -e

MODE="${1:-all}"

echo "----------------------------------------------"
echo " Wilrop - Docker Entrypoint (mode: ${MODE})"
echo "----------------------------------------------"

run_schema_repair() {
  echo "[schema] Checking for missing core tables..."
  set +e
  node <<'NODE'
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function tableExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT to_regclass('public."${name}"') IS NOT NULL AS table_exists`
  )
  return rows.some((r) => r.table_exists === true)
}

async function columnExists(table, column) {
  const [row] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2) AS exists`,
    table, column,
  )
  return row.exists
}

async function fkExists(name) {
  const [row] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = $1) AS exists`,
    name,
  )
  return row.exists
}

async function indexExists(name) {
  const [row] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = $1) AS exists`,
    name,
  )
  return row.exists
}

async function ensureTable(name, createSql) {
  const exists = await tableExists(name)
  if (exists) return false
  console.log(`[schema] Creating missing table: ${name}`)
  await prisma.$executeRawUnsafe(createSql)
  return true
}

async function ensureColumn(table, column, alterSql) {
  const exists = await columnExists(table, column)
  if (exists) return false
  console.log(`[schema] Adding missing column: ${table}.${column}`)
  await prisma.$executeRawUnsafe(alterSql)
  return true
}

async function ensureFk(name, alterSql) {
  const exists = await fkExists(name)
  if (exists) return false
  console.log(`[schema] Adding missing FK: ${name}`)
  await prisma.$executeRawUnsafe(alterSql)
  return true
}

async function ensureIndex(name, createSql) {
  const exists = await indexExists(name)
  if (exists) return false
  console.log(`[schema] Creating missing index: ${name}`)
  await prisma.$executeRawUnsafe(createSql)
  return true
}

async function main() {
  // Check if _prisma_migrations exists; if not, skip (first-run scenario)
  const migrationsExist = await tableExists('_prisma_migrations')
  if (!migrationsExist) {
    console.log('[schema] No _prisma_migrations table; skipping schema repair (first run).')
    return 0
  }

  // Check if 0_init is recorded as applied
  let initApplied = false
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT migration_name, finished_at FROM \"_prisma_migrations\" WHERE migration_name = '0_init'",
    )
    initApplied = rows.length > 0 && rows[0].finished_at !== null
  } catch {
    // Table query failed; treat as not applied
  }

  if (!initApplied) {
    // 0_init is NOT in _prisma_migrations — but the database might still be missing tables
    // (e.g. entry was deleted, or migrations were applied out of band).
    // Check core tables regardless; if they're missing, Prisma's migrate deploy
    // will try to apply 0_init but may hit ordering issues with later migrations.
    console.log('[schema] 0_init not recorded in _prisma_migrations; checking core tables anyway.')
  }

  // Verify core tables exist
  const coreTables = [
    'Admin', 'Destination', 'Hotel', 'RoomType', 'Allotment',
    'MarketingModal', 'TravelPackage', 'Excursion', 'Subagent',
    'Booking', 'BookingItem', 'TransportProvider', 'TransportService',
  ]

  const missing = []
  for (const t of coreTables) {
    if (!(await tableExists(t))) missing.push(t)
  }

  if (missing.length === 0) {
    console.log('[schema] All core tables present.')
  } else {
    console.log(`[schema] WARNING: ${missing.length} core table(s) missing: ${missing.join(', ')}`)
    console.log('[schema] Repairing missing tables from 0_init schema...')

    // Create missing tables (IF NOT EXISTS for safety)
  if (missing.includes('Admin')) {
    await ensureTable('Admin', `CREATE TABLE IF NOT EXISTS "Admin" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'admin',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
    )`)
    await ensureIndex('Admin_email_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email")`)
  }

  if (missing.includes('Destination')) {
    await ensureTable('Destination', `CREATE TABLE IF NOT EXISTS "Destination" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "region" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "highlights" TEXT NOT NULL,
      "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "reviewCount" INTEGER NOT NULL DEFAULT 0,
      "priceFrom" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
    )`)
    await ensureIndex('Destination_slug_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Destination_slug_key" ON "Destination"("slug")`)
  }

  if (missing.includes('Hotel')) {
    await ensureTable('Hotel', `CREATE TABLE IF NOT EXISTS "Hotel" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "cityId" TEXT NOT NULL,
      "cityName" TEXT NOT NULL,
      "stars" INTEGER NOT NULL DEFAULT 3,
      "address" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "images" TEXT NOT NULL DEFAULT '[]',
      "amenities" TEXT NOT NULL DEFAULT '[]',
      "rooms" TEXT NOT NULL DEFAULT '[]',
      "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "reviewCount" INTEGER NOT NULL DEFAULT 0,
      "priceFrom" INTEGER NOT NULL DEFAULT 0,
      "tags" TEXT NOT NULL DEFAULT '[]',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
    )`)
    await ensureIndex('Hotel_slug_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Hotel_slug_key" ON "Hotel"("slug")`)
  }

  if (missing.includes('RoomType')) {
    await ensureTable('RoomType', `CREATE TABLE IF NOT EXISTS "RoomType" (
      "id" TEXT NOT NULL,
      "hotelId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "maxGuests" INTEGER NOT NULL DEFAULT 2,
      "beds" TEXT NOT NULL DEFAULT '1 cama doble',
      "basePrice" INTEGER NOT NULL DEFAULT 0,
      "originalPrice" INTEGER NOT NULL DEFAULT 0,
      "includes" TEXT NOT NULL DEFAULT '[]',
      "roomImage" TEXT NOT NULL DEFAULT '',
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
    )`)
  }

  if (missing.includes('Allotment')) {
    await ensureTable('Allotment', `CREATE TABLE IF NOT EXISTS "Allotment" (
      "id" TEXT NOT NULL,
      "hotelId" TEXT NOT NULL,
      "roomTypeId" TEXT NOT NULL,
      "dateFrom" TIMESTAMP(3) NOT NULL,
      "dateTo" TIMESTAMP(3) NOT NULL,
      "totalRooms" INTEGER NOT NULL DEFAULT 0,
      "bookedRooms" INTEGER NOT NULL DEFAULT 0,
      "releaseDays" INTEGER NOT NULL DEFAULT 3,
      "netPrice" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Allotment_pkey" PRIMARY KEY ("id")
    )`)
  }

  if (missing.includes('MarketingModal')) {
    await ensureTable('MarketingModal', `CREATE TABLE IF NOT EXISTS "MarketingModal" (
      "id" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "title" TEXT NOT NULL DEFAULT '',
      "subtitle" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "imageUrl" TEXT NOT NULL DEFAULT '',
      "ctaText" TEXT NOT NULL DEFAULT 'Ver Oferta',
      "ctaLink" TEXT NOT NULL DEFAULT '',
      "ctaType" TEXT NOT NULL DEFAULT 'link',
      "timerEnabled" BOOLEAN NOT NULL DEFAULT false,
      "timerLabel" TEXT NOT NULL DEFAULT 'Oferta termina en',
      "timerEnd" TIMESTAMP(3),
      "position" TEXT NOT NULL DEFAULT 'center',
      "delayMs" INTEGER NOT NULL DEFAULT 3000,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "MarketingModal_pkey" PRIMARY KEY ("id")
    )`)
  }

  if (missing.includes('TravelPackage')) {
    await ensureTable('TravelPackage', `CREATE TABLE IF NOT EXISTS "TravelPackage" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "destinationId" TEXT NOT NULL,
      "destinationName" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "duration" TEXT NOT NULL,
      "price" INTEGER NOT NULL,
      "originalPrice" INTEGER,
      "includes" TEXT NOT NULL DEFAULT '[]',
      "image" TEXT NOT NULL DEFAULT '',
      "difficulty" TEXT NOT NULL DEFAULT 'Fácil',
      "groupSize" TEXT NOT NULL DEFAULT '',
      "departureDates" TEXT NOT NULL DEFAULT '[]',
      "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "soldOut" BOOLEAN NOT NULL DEFAULT false,
      "category" TEXT NOT NULL DEFAULT 'Cultural',
      "commission" INTEGER NOT NULL DEFAULT 10,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "TravelPackage_pkey" PRIMARY KEY ("id")
    )`)
    await ensureIndex('TravelPackage_slug_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "TravelPackage_slug_key" ON "TravelPackage"("slug")`)
  }

  if (missing.includes('Excursion')) {
    await ensureTable('Excursion', `CREATE TABLE IF NOT EXISTS "Excursion" (
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
    )`)
    await ensureIndex('Excursion_slug_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Excursion_slug_key" ON "Excursion"("slug")`)
  }

  if (missing.includes('Subagent')) {
    await ensureTable('Subagent', `CREATE TABLE IF NOT EXISTS "Subagent" (
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
    )`)
    await ensureIndex('Subagent_code_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Subagent_code_key" ON "Subagent"("code")`)
    await ensureIndex('Subagent_email_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Subagent_email_key" ON "Subagent"("email")`)
  }

  if (missing.includes('Booking')) {
    await ensureTable('Booking', `CREATE TABLE IF NOT EXISTS "Booking" (
      "id" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "guestName" TEXT NOT NULL DEFAULT '',
      "guestEmail" TEXT NOT NULL DEFAULT '',
      "guestPhone" TEXT NOT NULL DEFAULT '',
      "guestCountry" TEXT NOT NULL DEFAULT '',
      "adults" INTEGER NOT NULL DEFAULT 1,
      "children" INTEGER NOT NULL DEFAULT 0,
      "childrenAges" TEXT NOT NULL DEFAULT '[]',
      "notes" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "totalPrice" INTEGER NOT NULL DEFAULT 0,
      "netPrice" INTEGER NOT NULL DEFAULT 0,
      "commissionAmt" INTEGER NOT NULL DEFAULT 0,
      "checkIn" TIMESTAMP(3),
      "checkOut" TIMESTAMP(3),
      "bookedBy" TEXT NOT NULL DEFAULT 'b2c',
      "subagentId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
    )`)
    await ensureIndex('Booking_code_key',
      `CREATE UNIQUE INDEX IF NOT EXISTS "Booking_code_key" ON "Booking"("code")`)
  }

  if (missing.includes('BookingItem')) {
    await ensureTable('BookingItem', `CREATE TABLE IF NOT EXISTS "BookingItem" (
      "id" TEXT NOT NULL,
      "bookingId" TEXT NOT NULL,
      "itemType" TEXT NOT NULL DEFAULT '',
      "serviceId" TEXT NOT NULL DEFAULT '',
      "serviceName" TEXT NOT NULL DEFAULT '',
      "roomTypeId" TEXT NOT NULL DEFAULT '',
      "roomName" TEXT NOT NULL DEFAULT '',
      "dateFrom" TEXT NOT NULL DEFAULT '',
      "dateTo" TEXT NOT NULL DEFAULT '',
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "unitPrice" INTEGER NOT NULL DEFAULT 0,
      "totalPrice" INTEGER NOT NULL DEFAULT 0,
      "addons" TEXT NOT NULL DEFAULT '[]',
      "status" TEXT NOT NULL DEFAULT 'confirmed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
    )`)
  }

  if (missing.includes('TransportProvider')) {
    await ensureTable('TransportProvider', `CREATE TABLE IF NOT EXISTS "TransportProvider" (
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
    )`)
  }

  if (missing.includes('TransportService')) {
    await ensureTable('TransportService', `CREATE TABLE IF NOT EXISTS "TransportService" (
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
    )`)
  }

  // Ensure FKs from 0_init (in case tables were created but FKs missing)
  await ensureFk('RoomType_hotelId_fkey',
    `ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
  await ensureFk('Allotment_hotelId_fkey',
    `ALTER TABLE "Allotment" ADD CONSTRAINT "Allotment_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
  await ensureFk('Allotment_roomTypeId_fkey',
    `ALTER TABLE "Allotment" ADD CONSTRAINT "Allotment_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
  await ensureFk('Booking_subagentId_fkey',
    `ALTER TABLE "Booking" ADD CONSTRAINT "Booking_subagentId_fkey" FOREIGN KEY ("subagentId") REFERENCES "Subagent"("id") ON DELETE SET NULL ON UPDATE CASCADE`)
  await ensureFk('BookingItem_bookingId_fkey',
    `ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE`)
  await ensureFk('TransportService_providerId_fkey',
    `ALTER TABLE "TransportService" ADD CONSTRAINT "TransportService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TransportProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE`)

  // Ensure columns from subsequent migrations (20260504120000)
  await ensureColumn('Subagent', 'sellerLevel',
    `ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "sellerLevel" TEXT NOT NULL DEFAULT 'standard'`)
  await ensureColumn('Subagent', 'whiteLabelEnabled',
    `ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false`)

  // Ensure columns from 20260515120000_add_template_flags
  await ensureColumn('Destination', 'isTemplate',
    `ALTER TABLE "Destination" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)
  await ensureColumn('Hotel', 'isTemplate',
    `ALTER TABLE "Hotel" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)
  await ensureColumn('TravelPackage', 'isTemplate',
    `ALTER TABLE "TravelPackage" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)
  await ensureColumn('Excursion', 'isTemplate',
    `ALTER TABLE "Excursion" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)
  await ensureColumn('TransportProvider', 'isTemplate',
    `ALTER TABLE "TransportProvider" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)
  await ensureColumn('TransportService', 'isTemplate',
    `ALTER TABLE "TransportService" ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN NOT NULL DEFAULT true`)

  // Ensure columns from 20260517000000_add_reseller_approval_fields
  await ensureColumn('Subagent', 'approvalStatus',
    `ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'pending'`)
  await ensureColumn('Subagent', 'registrationDate',
    `ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`)
  }

  // If 0_init was not recorded in _prisma_migrations, register it now so
  // migrate deploy won't try to re-apply it (and fail on CREATE TABLE).
  if (!initApplied) {
    try {
      const fs = require('fs')
      const crypto = require('crypto')
      const migrationPath = '/app/prisma/migrations/0_init/migration.sql'
      const content = fs.readFileSync(migrationPath, 'utf8')
      const checksum = crypto.createHash('sha256').update(content).digest('hex')

      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES ($1, $2, NOW(), '0_init', NULL, NULL, NOW(), 1)
         ON CONFLICT (migration_name) DO NOTHING`,
        '0_init', checksum,
      )
      console.log('[schema] Registered 0_init in _prisma_migrations to prevent re-application.')
    } catch (err) {
      console.log('[schema] Could not register 0_init in _prisma_migrations:', err.message)
    }
  }

  console.log('[schema] Schema repair complete.')
  return 0
}

main()
  .then(async (code) => {
    await prisma.$disconnect()
    process.exit(code)
  })
  .catch(async (error) => {
    console.error('[schema] Repair error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  })
NODE
  schema_status=$?
  set -e

  if [ "$schema_status" -ne 0 ]; then
    echo "[schema] Schema repair failed (exit: ${schema_status})."
    exit "$schema_status"
  fi
}

run_migration_repair() {
  echo "[pre] Checking for failed migrations to repair..."
  set +e
  node <<'NODE'
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const migrationsToWatch = [
  '20260504120000_add_reseller_capabilities',
  '20260517000000_add_reseller_approval_fields',
  '20260518093439_agregar_modelos_reseller',
]

function tableExistsQuery(name) {
  return `SELECT to_regclass('public."${name}"') IS NOT NULL AS table_exists`
}

async function checkTableExists(name) {
  const rows = await prisma.$queryRawUnsafe(tableExistsQuery(name))
  return rows.some((row) => row.table_exists === true)
}

async function columnExists(table, column) {
  const [row] = await prisma.$queryRawUnsafe(
    `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2) AS exists`,
    table, column,
  )
  return row.exists
}

async function main() {
  let rows = []

  try {
    rows = await prisma.$queryRawUnsafe(
      'SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = ANY($1)',
      migrationsToWatch,
    )
  } catch {
    console.log('No _prisma_migrations table yet; no repair needed.')
    return 0
  }

  const failedMigrations = rows.filter((row) => row.finished_at === null && row.rolled_back_at === null)

  if (failedMigrations.length === 0) {
    console.log('No failed migrations pending.')
    return 0
  }

  for (const failed of failedMigrations) {
    const migrationName = failed.migration_name
    console.log(`Checking failed migration: ${migrationName}`)

    if (migrationName === '20260504120000_add_reseller_capabilities') {
      const tableRows = await prisma.$queryRawUnsafe(tableExistsQuery('Subagent'))
      const subagentTableExists = tableRows.some((row) => row.table_exists === true)

      if (!subagentTableExists) {
        console.log(`Subagent table does not exist; rolling back ${migrationName} so Prisma can replay.`)
        return 20
      }

      console.log(`Repairing migration ${migrationName}...`)
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "sellerLevel" TEXT NOT NULL DEFAULT \'standard\'',
      )
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false',
      )
      return 10
    }

    if (migrationName === '20260517000000_add_reseller_approval_fields') {
      console.log(`Repairing migration ${migrationName}...`)
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT \'approved\'',
      )
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
      )
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Subagent" ALTER COLUMN "active" SET DEFAULT false',
      )
      return 10
    }

    if (migrationName === '20260518093439_agregar_modelos_reseller') {
      const resellerTable = await checkTableExists('Reseller')
      const catalogTable = await checkTableExists('ResellerCatalog')
      const saleTable = await checkTableExists('ResellerSale')
      const clientTable = await checkTableExists('ResellerClient')
      const docTable = await checkTableExists('ResellerDocument')
      const bookingCol = await columnExists('Booking', 'resellerId')

      const allExist = resellerTable && catalogTable && saleTable && clientTable && docTable && bookingCol

      if (allExist) {
        console.log('All Reseller migration artifacts exist; marking as applied.')
        return 10
      }

      console.log('Partial or missing Reseller migration artifacts; cleaning up and marking as rolled-back.')

      // Drop partial tables in reverse dependency order so FK constraints don't block
      const partialTables = [
        { name: 'ResellerDocument', needed: docTable },
        { name: 'ResellerClient', needed: clientTable },
        { name: 'ResellerSale', needed: saleTable },
        { name: 'ResellerCatalog', needed: catalogTable },
        { name: 'Reseller', needed: resellerTable },
      ]

      for (const t of partialTables) {
        if (t.needed) {
          console.log(`Dropping partial table: ${t.name}`)
          await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${t.name}" CASCADE`)
        }
      }

      // Remove the resellerId column from Booking if it was partially added
      if (bookingCol) {
        console.log('Dropping partial column: Booking.resellerId')
        await prisma.$executeRawUnsafe('ALTER TABLE "Booking" DROP COLUMN IF EXISTS "resellerId"')
      }

      return 20
    }
  }

  return 0
}

main()
  .then(async (code) => {
    await prisma.$disconnect()
    process.exit(code)
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
NODE
  repair_status=$?
  set -e

  if [ "$repair_status" -eq 10 ]; then
    echo "[pre] Marking failed migration as applied after repair..."
    for m in 20260504120000_add_reseller_capabilities 20260517000000_add_reseller_approval_fields 20260518093439_agregar_modelos_reseller; do
      node /app/node_modules/prisma/build/index.js migrate resolve --applied "$m" 2>/dev/null || true
    done
  elif [ "$repair_status" -eq 20 ]; then
    echo "[pre] Rolling back failed migration so migrate deploy can retry..."
    for m in 20260504120000_add_reseller_capabilities 20260517000000_add_reseller_approval_fields 20260518093439_agregar_modelos_reseller; do
      node /app/node_modules/prisma/build/index.js migrate resolve --rolled-back "$m" 2>/dev/null || true
    done
  elif [ "$repair_status" -ne 0 ]; then
    echo "[pre] Migration repair failed."
    exit "$repair_status"
  fi
}

print_database_target() {
  node <<'NODE'
const value = process.env.DATABASE_URL
if (!value) {
  console.log('[db] DATABASE_URL is not set.')
  process.exit(0)
}

try {
  const url = new URL(value)
  const username = url.username || '(no-user)'
  const hostname = url.hostname || '(no-host)'
  const port = url.port || '(no-port)'
  const database = (url.pathname || '').replace(/^\//, '') || '(no-db)'
  console.log(`[db] Target: ${username}@${hostname}:${port}/${database}`)
} catch {
  console.log('[db] DATABASE_URL is set but not a valid URL.')
}
NODE
}

run_migration_status() {
  step_label="${1:-[status]}"
  echo "${step_label} Checking Prisma migration status..."
  print_database_target
  set +e
  NO_COLOR=1 FORCE_COLOR=0 node /app/node_modules/prisma/build/index.js migrate status --schema=/app/prisma/schema.prisma 2>&1 | tee /tmp/migration_status.log
  status_code=$?
  set -e

  if [ "$status_code" -ne 0 ]; then
    if grep -qi "Following migration have not yet been applied" /tmp/migration_status.log; then
      echo "[db] Pending migrations detected. They will be applied in the next step."
    else
      echo "[db] Prisma migrate status failed (exit: ${status_code})."
      echo "[db] If this is P1000: verify DATABASE_URL credentials."
      echo "[db] Note: in Postgres containers, POSTGRES_PASSWORD applies only at first init; changing env later won't change an existing volume's password."
      exit "$status_code"
    fi
  else
    echo "[db] All migrations are up to date."
  fi
}

run_migrations() {
  step_label="${1:-[migrate]}"
  echo "${step_label} Applying Prisma migrations..."
  node /app/node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma
}

run_admin_bootstrap() {
  step_label="${1:-[admin]}"
  echo "${step_label} Ensuring admin bootstrap account..."
  node /app/scripts/ensure-admin.mjs
}

run_web() {
  echo "[web] Starting Next.js server on port ${PORT:-3000}..."
  exec node /app/server.js
}

case "$MODE" in
  migrate)
    run_schema_repair
    run_migration_repair
    run_migration_status "[1/3]"
    run_migrations "[2/3]"
    run_admin_bootstrap "[3/3]"
    echo "[done] Migrations/admin bootstrap completed."
    exit 0
    ;;
  web)
    run_schema_repair
    run_migration_repair
    run_migration_status "[1/3]"
    run_migrations "[2/3]"
    echo "[3/3] Starting Next.js server on port ${PORT:-3000}..."
    exec node /app/server.js
    ;;
  all)
    run_schema_repair
    run_migration_repair
    run_migration_status "[1/4]"
    run_migrations "[2/4]"
    run_admin_bootstrap "[3/4]"
    echo "[4/4] Starting Next.js server on port ${PORT:-3000}..."
    exec node /app/server.js
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: docker-entrypoint.sh [all|migrate|web]"
    exit 2
    ;;
esac
