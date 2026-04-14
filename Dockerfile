# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: instala dependencias con Bun (reproducible)
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./

# --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
RUN bun install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder: genera el cliente Prisma y compila Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Genera el cliente Prisma para la plataforma linux-musl (Alpine)
RUN bunx prisma generate

# Compila Next.js en modo standalone;
# el script de build también copia static/ y public/ dentro de .next/standalone/
RUN bun run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: imagen de producción mínima
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Usuario no-root para seguridad (OWASP)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Next.js standalone ────────────────────────────────────────────────────────
# Incluye server.js + node_modules mínimos de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Assets estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
# Archivos públicos
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma runtime ────────────────────────────────────────────────────────────
# Cliente generado + binario del query engine (linux-musl)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma         ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client  ./node_modules/@prisma/client
# CLI de Prisma (incluye el migration engine para `migrate deploy`)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma          ./node_modules/prisma
# Schema + migraciones (necesarios en runtime para migrate deploy)
COPY --from=builder --chown=nextjs:nodejs /app/prisma                       ./prisma

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
