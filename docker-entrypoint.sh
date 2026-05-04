#!/bin/sh
# docker-entrypoint.sh — se ejecuta al iniciar el contenedor
set -e

echo "──────────────────────────────────────────────"
echo " Wilrop — Docker Entrypoint"
echo "──────────────────────────────────────────────"

echo "[pre] Revisando reparaciÃ³n de migraciÃ³n reseller..."
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
    console.log('No existe _prisma_migrations todavÃ­a; no hay reparaciÃ³n pendiente.')
    return 0
  }

  const failedMigration = rows.some((row) => row.finished_at === null && row.rolled_back_at === null)

  if (!failedMigration) {
    console.log('No hay migraciÃ³n reseller fallida pendiente.')
    return 0
  }

  console.log(`Reparando migraciÃ³n fallida ${migrationName}...`)
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
  echo "[pre] Marcando migraciÃ³n reseller como aplicada tras reparaciÃ³n..."
  node /app/node_modules/prisma/build/index.js migrate resolve --applied 20260504120000_add_reseller_capabilities
elif [ "$repair_status" -ne 0 ]; then
  echo "[pre] FallÃ³ la reparaciÃ³n preventiva de migraciÃ³n."
  exit "$repair_status"
fi

echo "[1/2] Aplicando migraciones Prisma..."
# Usa el CLI de Prisma copiado desde el builder stage
# `migrate deploy` aplica migraciones pendientes sin interacción
node /app/node_modules/prisma/build/index.js migrate deploy

echo "[2/2] Iniciando servidor Next.js en puerto ${PORT:-3000}..."
exec node /app/server.js
