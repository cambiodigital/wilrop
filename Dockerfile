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
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Genera el cliente Prisma para la plataforma linux-musl (Alpine)
RUN node /app/node_modules/prisma/build/index.js generate

# Compila Next.js en modo standalone;
# el script de build también copia static/ y public/ dentro de .next/standalone/
RUN node /app/node_modules/next/dist/bin/next build \
 && cp -r .next/static .next/standalone/.next/ \
 && cp -r public .next/standalone/

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: imagen de producción mínima
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache curl

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
# Copia node_modules completo para asegurar dependencias transitivas del CLI
# (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules                 ./node_modules
# Schema + migraciones (necesarios en runtime para migrate deploy)
COPY --from=builder --chown=nextjs:nodejs /app/prisma                       ./prisma
# Scripts operativos usados por el entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs      ./scripts/ensure-admin.mjs
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs         ./src/lib/password.mjs
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs   ./src/lib/secure-compare.mjs

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

LABEL traefik.enable=true
LABEL traefik.http.routers.wilrop.rule="Host(`wilropgroup.com`) || HostRegexp(`^[a-zA-Z0-9][a-zA-Z0-9-]+[.]wilropgroup[.]com$`)"
LABEL traefik.http.routers.wilrop.tls=true
LABEL traefik.http.routers.wilrop.tls.certResolver=letsencrypt
LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["web"]
