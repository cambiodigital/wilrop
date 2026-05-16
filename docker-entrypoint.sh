#!/bin/sh
# docker-entrypoint.sh - runs when the container starts
set -e

MODE="${1:-all}"

echo "----------------------------------------------"
echo " Wilrop - Docker Entrypoint (mode: ${MODE})"
echo "----------------------------------------------"

run_migration_repair() {
  echo "[pre] Checking reseller migration repair..."
  set +e
  node <<'NODE'
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const migrationName = '20260504120000_add_reseller_capabilities'

async function main() {
  let rows = []

  try {
    rows = await prisma.$queryRawUnsafe(
      'SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = $1',
      migrationName,
    )
  } catch {
    console.log('No _prisma_migrations table yet; no repair needed.')
    return 0
  }

  const failedMigration = rows.some((row) => row.finished_at === null && row.rolled_back_at === null)

  if (!failedMigration) {
    console.log('No failed reseller migration pending.')
    return 0
  }

  const tableRows = await prisma.$queryRawUnsafe(
    "SELECT to_regclass('public.\"Subagent\"') IS NOT NULL AS table_exists",
  )
  const subagentTableExists = tableRows.some((row) => row.table_exists === true)

  if (!subagentTableExists) {
    console.log('Subagent table does not exist; rolling back the failed reseller migration so Prisma can replay migrations.')
    return 20
  }

  console.log(`Repairing failed migration ${migrationName}...`)
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "sellerLevel" TEXT NOT NULL DEFAULT \'standard\'',
  )
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "Subagent" ADD COLUMN IF NOT EXISTS "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false',
  )
  return 10
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
    echo "[pre] Marking reseller migration as applied after repair..."
    node /app/node_modules/prisma/build/index.js migrate resolve --applied 20260504120000_add_reseller_capabilities
  elif [ "$repair_status" -eq 20 ]; then
    echo "[pre] Marking reseller migration as rolled back so migrate deploy can apply it again..."
    node /app/node_modules/prisma/build/index.js migrate resolve --rolled-back 20260504120000_add_reseller_capabilities
  elif [ "$repair_status" -ne 0 ]; then
    echo "[pre] Reseller migration repair failed."
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
  NO_COLOR=1 FORCE_COLOR=0 node /app/node_modules/prisma/build/index.js migrate status --schema=/app/prisma/schema.prisma
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
