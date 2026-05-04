#!/bin/sh
# docker-entrypoint.sh - runs when the container starts
set -e

echo "----------------------------------------------"
echo " Wilrop - Docker Entrypoint"
echo "----------------------------------------------"

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
    "SELECT to_regclass('public.\"Subagent\"') AS table_name",
  )
  const subagentTableExists = tableRows.some((row) => row.table_name !== null)

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

echo "[1/2] Applying Prisma migrations..."
node /app/node_modules/prisma/build/index.js migrate deploy

echo "[2/2] Starting Next.js server on port ${PORT:-3000}..."
exec node /app/server.js
