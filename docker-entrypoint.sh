#!/bin/sh
# docker-entrypoint.sh - runs when the container starts
set -e

MODE="${1:-all}"

echo "----------------------------------------------"
echo " Wilrop - Docker Entrypoint (mode: ${MODE})"
echo "----------------------------------------------"

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
    run_migration_repair
    run_migration_status "[1/3]"
    run_migrations "[2/3]"
    run_admin_bootstrap "[3/3]"
    echo "[done] Migrations/admin bootstrap completed."
    exit 0
    ;;
  web)
    run_migration_repair
    run_migration_status "[1/3]"
    run_migrations "[2/3]"
    echo "[3/3] Starting Next.js server on port ${PORT:-3000}..."
    exec node /app/server.js
    ;;
  all)
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
