#!/bin/sh
# docker-entrypoint.sh — se ejecuta al iniciar el contenedor
set -e

echo "──────────────────────────────────────────────"
echo " Wilrop — Docker Entrypoint"
echo "──────────────────────────────────────────────"

echo "[1/2] Aplicando migraciones Prisma..."
# Usa el CLI de Prisma copiado desde el builder stage
# `migrate deploy` aplica migraciones pendientes sin interacción
node /app/node_modules/prisma/build/index.js migrate deploy

echo "[2/2] Iniciando servidor Next.js en puerto ${PORT:-3000}..."
exec node /app/server.js
