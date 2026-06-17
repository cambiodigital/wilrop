2026-Jun-17 11:15:40.909584 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 11:15:40.917702 Starting deployment of wilrop-app to localhost.
2026-Jun-17 11:15:41.238737 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 11:15:41.359684 [CMD]: docker stop --time=30 mqdn2cgy8wrw0ptm01kn4hm8
2026-Jun-17 11:15:41.359684 Error response from daemon: No such container: mqdn2cgy8wrw0ptm01kn4hm8
2026-Jun-17 11:15:41.504664 [CMD]: docker run -d --network 'coolify' --name mqdn2cgy8wrw0ptm01kn4hm8 --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 11:15:41.504664 e95e327ac1d9b46f4da4ec90b0c0c1e7ddd9924258fdffaa88ec7d52c47f5b21
2026-Jun-17 11:15:44.092624 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 11:15:44.092624 1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe refs/heads/main
2026-Jun-17 11:15:44.233463 ----------------------------------------
2026-Jun-17 11:15:44.240380 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha 1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe) to /artifacts/mqdn2cgy8wrw0ptm01kn4hm8.
2026-Jun-17 11:15:44.536896 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'mkdir -p /root/.ssh' && docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 > /dev/null' && docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8' && docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/mqdn2cgy8wrw0ptm01kn4hm8'\'' && cd '\''/artifacts/mqdn2cgy8wrw0ptm01kn4hm8'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe'\'' && git -c advice.detachedHead=false checkout '\''1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe'\'' >/dev/null 2>&1 && cd '\''/artifacts/mqdn2cgy8wrw0ptm01kn4hm8'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/mqdn2cgy8wrw0ptm01kn4hm8'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_mqdn2cgy8wrw0ptm01kn4hm8 -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 11:15:44.536896 Cloning into '/artifacts/mqdn2cgy8wrw0ptm01kn4hm8'...
2026-Jun-17 11:15:49.330827 From github.com:cambiodigital/wilrop
2026-Jun-17 11:15:49.330827 * branch 1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe -> FETCH_HEAD
2026-Jun-17 11:15:51.157173 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'cd /artifacts/mqdn2cgy8wrw0ptm01kn4hm8 && git log -1 '\''1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe'\'' --pretty=%B'
2026-Jun-17 11:15:51.157173 fix(docker-entrypoint): improve database connection error handling
2026-Jun-17 11:15:51.157173
2026-Jun-17 11:15:51.157173 Add detection for common Prisma and network connection errors, including P1000-P1002, ECONNREFUSED, timeout and DNS lookup failures. Log targeted warning messages with guidance for configuring Neon DBs with sslmode=require. Avoid immediate exit on transient connection errors to allow migrate deploy to proceed, and include full error log output in generic failure cases for easier debugging.
2026-Jun-17 11:15:56.741122 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'test -f /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 11:15:56.741122 exists
2026-Jun-17 11:15:56.896544 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'cat /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/Dockerfile'
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 FROM oven/bun:1-alpine AS deps
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 WORKDIR /app
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 COPY package.json bun.lock ./
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 11:15:56.896544 RUN bun install --frozen-lockfile
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 FROM node:22-alpine AS builder
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 WORKDIR /app
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:15:56.896544 COPY . .
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 11:15:56.896544 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # Compila Next.js en modo standalone;
2026-Jun-17 11:15:56.896544 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 11:15:56.896544 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 11:15:56.896544 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 11:15:56.896544 && cp -r public .next/standalone/
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 11:15:56.896544 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 FROM node:22-alpine AS runner
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 WORKDIR /app
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 ENV NODE_ENV=production
2026-Jun-17 11:15:56.896544 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:15:56.896544 ENV PORT=3000
2026-Jun-17 11:15:56.896544 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 RUN apk add --no-cache curl
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 11:15:56.896544 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 11:15:56.896544 && adduser --system --uid 1001 nextjs
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:15:56.896544 # Assets estáticos
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:15:56.896544 # Archivos públicos
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 11:15:56.896544 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:15:56.896544 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:15:56.896544 # Scripts operativos usados por el entrypoint
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:15:56.896544 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:56.896544 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:15:56.896544 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 USER nextjs
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 EXPOSE 3000
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 LABEL traefik.enable=true
2026-Jun-17 11:15:56.896544 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 11:15:56.896544 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 11:15:56.896544
2026-Jun-17 11:15:56.896544 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 11:15:56.896544 CMD ["web"]
2026-Jun-17 11:15:57.063468 Added 36 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 11:15:57.217924 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'test -f /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 11:15:57.217924 exists
2026-Jun-17 11:15:57.386435 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'cat /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/Dockerfile'
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 FROM oven/bun:1-alpine AS deps
2026-Jun-17 11:15:57.386435 ARG COOLIFY_FQDN
2026-Jun-17 11:15:57.386435 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_SECRET
2026-Jun-17 11:15:57.386435 ARG DATABASE_URL
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_URL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:15:57.386435 ARG PORT
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 WORKDIR /app
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 COPY package.json bun.lock ./
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 11:15:57.386435 RUN bun install --frozen-lockfile
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 FROM node:22-alpine AS builder
2026-Jun-17 11:15:57.386435 ARG COOLIFY_FQDN
2026-Jun-17 11:15:57.386435 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_SECRET
2026-Jun-17 11:15:57.386435 ARG DATABASE_URL
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_URL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:15:57.386435 ARG PORT
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 WORKDIR /app
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:15:57.386435 COPY . .
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 11:15:57.386435 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # Compila Next.js en modo standalone;
2026-Jun-17 11:15:57.386435 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 11:15:57.386435 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 11:15:57.386435 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 11:15:57.386435 && cp -r public .next/standalone/
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 11:15:57.386435 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 FROM node:22-alpine AS runner
2026-Jun-17 11:15:57.386435 ARG COOLIFY_FQDN
2026-Jun-17 11:15:57.386435 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_SECRET
2026-Jun-17 11:15:57.386435 ARG DATABASE_URL
2026-Jun-17 11:15:57.386435 ARG NEXTAUTH_URL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:15:57.386435 ARG PORT
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:15:57.386435 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:15:57.386435 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 WORKDIR /app
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 ENV NODE_ENV=production
2026-Jun-17 11:15:57.386435 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:15:57.386435 ENV PORT=3000
2026-Jun-17 11:15:57.386435 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 RUN apk add --no-cache curl
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 11:15:57.386435 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 11:15:57.386435 && adduser --system --uid 1001 nextjs
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:15:57.386435 # Assets estáticos
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:15:57.386435 # Archivos públicos
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 11:15:57.386435 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:15:57.386435 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:15:57.386435 # Scripts operativos usados por el entrypoint
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:15:57.386435 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 11:15:57.386435 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:15:57.386435 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 USER nextjs
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 EXPOSE 3000
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 LABEL traefik.enable=true
2026-Jun-17 11:15:57.386435 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 11:15:57.386435 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 11:15:57.386435
2026-Jun-17 11:15:57.386435 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 11:15:57.386435 CMD ["web"]
2026-Jun-17 11:15:57.396909 Service app: All required ARG declarations already exist.
2026-Jun-17 11:15:57.404231 Pulling & building required images.
2026-Jun-17 11:15:57.472295 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 11:15:57.640018 Adding build arguments to Docker Compose build command.
2026-Jun-17 11:15:58.028670 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/mqdn2cgy8wrw0ptm01kn4hm8 -f /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg WILROP_ADMIN_EMAIL --build-arg WILROP_ADMIN_NAME --build-arg COOLIFY_BUILD_SECRETS_HASH=ef5d4bc9c448dc9793973b6e6b1412383a2c0e6468e9efa33500e2683b339b43'
2026-Jun-17 11:15:58.028670 #1 [internal] load local bake definitions
2026-Jun-17 11:15:58.264831 #1 reading from stdin 2.54kB done
2026-Jun-17 11:15:58.264831 #1 DONE 0.0s
2026-Jun-17 11:15:58.264831
2026-Jun-17 11:15:58.264831 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 11:15:58.264831 #2 transferring dockerfile: 5.44kB done
2026-Jun-17 11:15:58.264831 #2 DONE 0.0s
2026-Jun-17 11:15:58.264831
2026-Jun-17 11:15:58.264831 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 11:15:58.264831 #3 transferring dockerfile: 5.44kB done
2026-Jun-17 11:15:58.264831 #3 DONE 0.0s
2026-Jun-17 11:15:58.264831
2026-Jun-17 11:15:58.264831 #4 [app internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 11:15:59.063129 #4 DONE 0.8s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #5 [app internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 11:15:59.063129 #5 DONE 0.8s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #6 [migrate internal] load .dockerignore
2026-Jun-17 11:15:59.063129 #6 transferring context: 1.12kB done
2026-Jun-17 11:15:59.063129 #6 DONE 0.0s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #7 [app builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 11:15:59.063129 #7 DONE 0.0s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #8 [app internal] load .dockerignore
2026-Jun-17 11:15:59.063129 #8 transferring context: 1.12kB done
2026-Jun-17 11:15:59.063129 #8 DONE 0.0s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #9 [app deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 11:15:59.063129 #9 DONE 0.0s
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #10 [app builder 2/6] WORKDIR /app
2026-Jun-17 11:15:59.063129 #10 CACHED
2026-Jun-17 11:15:59.063129
2026-Jun-17 11:15:59.063129 #11 [migrate internal] load build context
2026-Jun-17 11:15:59.417246 #11 transferring context: 12.06MB 0.3s done
2026-Jun-17 11:15:59.417246 #11 DONE 0.3s
2026-Jun-17 11:15:59.417246
2026-Jun-17 11:15:59.417246 #12 [app internal] load build context
2026-Jun-17 11:15:59.417246 #12 transferring context: 12.06MB 0.2s done
2026-Jun-17 11:15:59.417246 #12 DONE 0.2s
2026-Jun-17 11:15:59.417246
2026-Jun-17 11:15:59.417246 #13 [migrate deps 2/4] WORKDIR /app
2026-Jun-17 11:15:59.417246 #13 CACHED
2026-Jun-17 11:15:59.417246
2026-Jun-17 11:15:59.417246 #14 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 11:15:59.417246 #14 CACHED
2026-Jun-17 11:15:59.417246
2026-Jun-17 11:15:59.417246 #15 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 11:15:59.622835 #15 0.406 bun install v1.3.14 (0d9b296a)
2026-Jun-17 11:16:01.766799 #15 ...
2026-Jun-17 11:16:01.766799
2026-Jun-17 11:16:01.766799 #16 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 11:16:01.766799 #16 1.312 (1/9) Installing brotli-libs (1.2.0-r1)
2026-Jun-17 11:16:01.766799 #16 1.373 (2/9) Installing c-ares (1.34.6-r0)
2026-Jun-17 11:16:01.766799 #16 1.411 (3/9) Installing libunistring (1.4.2-r0)
2026-Jun-17 11:16:01.766799 #16 1.459 (4/9) Installing libidn2 (2.3.8-r0)
2026-Jun-17 11:16:01.766799 #16 1.492 (5/9) Installing nghttp2-libs (1.69.0-r0)
2026-Jun-17 11:16:01.766799 #16 1.541 (6/9) Installing libpsl (0.21.5-r3)
2026-Jun-17 11:16:01.766799 #16 1.574 (7/9) Installing zstd-libs (1.5.7-r2)
2026-Jun-17 11:16:01.766799 #16 1.618 (8/9) Installing libcurl (8.20.0-r1)
2026-Jun-17 11:16:01.766799 #16 1.660 (9/9) Installing curl (8.20.0-r1)
2026-Jun-17 11:16:01.766799 #16 1.701 Executing busybox-1.37.0-r31.trigger
2026-Jun-17 11:16:01.766799 #16 1.747 OK: 15.9 MiB in 27 packages
2026-Jun-17 11:16:01.766799 #16 DONE 2.7s
2026-Jun-17 11:16:01.918100 #17 [migrate runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 11:16:03.702117 #17 DONE 1.9s
2026-Jun-17 11:16:03.702117
2026-Jun-17 11:16:03.702117 #15 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 11:16:09.278403 #15 10.06
2026-Jun-17 11:16:09.278403 #15 10.06 + @tailwindcss/postcss@4.1.18
2026-Jun-17 11:16:09.278403 #15 10.06 + @types/react@19.2.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @types/react-dom@19.2.3
2026-Jun-17 11:16:09.278403 #15 10.06 + bun-types@1.3.6
2026-Jun-17 11:16:09.278403 #15 10.06 + eslint@9.39.2
2026-Jun-17 11:16:09.278403 #15 10.06 + eslint-config-next@16.1.3
2026-Jun-17 11:16:09.278403 #15 10.06 + tailwindcss@4.1.18
2026-Jun-17 11:16:09.278403 #15 10.06 + tw-animate-css@1.4.0
2026-Jun-17 11:16:09.278403 #15 10.06 + typescript@5.9.3
2026-Jun-17 11:16:09.278403 #15 10.06 + @dnd-kit/core@6.3.1
2026-Jun-17 11:16:09.278403 #15 10.06 + @dnd-kit/sortable@10.0.0
2026-Jun-17 11:16:09.278403 #15 10.06 + @dnd-kit/utilities@3.2.2
2026-Jun-17 11:16:09.278403 #15 10.06 + @hookform/resolvers@5.2.2
2026-Jun-17 11:16:09.278403 #15 10.06 + @mdxeditor/editor@3.52.3
2026-Jun-17 11:16:09.278403 #15 10.06 + @prisma/client@6.19.2
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-accordion@1.2.12
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-alert-dialog@1.1.15
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-aspect-ratio@1.1.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-avatar@1.1.11
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-checkbox@1.3.3
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-collapsible@1.1.12
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-context-menu@2.2.16
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-dialog@1.1.15
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-dropdown-menu@2.1.16
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-hover-card@1.1.15
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-label@2.1.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-menubar@1.1.16
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-navigation-menu@1.2.14
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-popover@1.1.15
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-progress@1.1.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-radio-group@1.3.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-scroll-area@1.2.10
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-select@2.2.6
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-separator@1.1.8
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-slider@1.3.6
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-slot@1.2.4
2026-Jun-17 11:16:09.278403 #15 10.06 + @radix-ui/react-switch@1.2.6
2026-Jun-17 11:16:09.282648 #15 10.06 + @radix-ui/react-tabs@1.1.13
2026-Jun-17 11:16:09.282648 #15 10.06 + @radix-ui/react-toast@1.2.15
2026-Jun-17 11:16:09.282648 #15 10.06 + @radix-ui/react-toggle@1.1.10
2026-Jun-17 11:16:09.282648 #15 10.06 + @radix-ui/react-toggle-group@1.1.11
2026-Jun-17 11:16:09.282648 #15 10.06 + @radix-ui/react-tooltip@1.2.8
2026-Jun-17 11:16:09.282648 #15 10.06 + @reactuses/core@6.1.9
2026-Jun-17 11:16:09.282648 #15 10.06 + @tanstack/react-query@5.90.19
2026-Jun-17 11:16:09.282648 #15 10.06 + @tanstack/react-table@8.21.3
2026-Jun-17 11:16:09.282648 #15 10.06 + bcryptjs@3.0.3
2026-Jun-17 11:16:09.282648 #15 10.06 + class-variance-authority@0.7.1
2026-Jun-17 11:16:09.282648 #15 10.06 + clsx@2.1.1
2026-Jun-17 11:16:09.282648 #15 10.06 + cmdk@1.1.1
2026-Jun-17 11:16:09.282648 #15 10.06 + date-fns@4.1.0
2026-Jun-17 11:16:09.282648 #15 10.06 + embla-carousel-react@8.6.0
2026-Jun-17 11:16:09.282648 #15 10.06 + framer-motion@12.26.2
2026-Jun-17 11:16:09.282648 #15 10.06 + input-otp@1.4.2
2026-Jun-17 11:16:09.282648 #15 10.06 + lucide-react@0.525.0
2026-Jun-17 11:16:09.282648 #15 10.06 + next@16.1.3
2026-Jun-17 11:16:09.282648 #15 10.06 + next-auth@4.24.13
2026-Jun-17 11:16:09.282648 #15 10.06 + next-intl@4.7.0
2026-Jun-17 11:16:09.282648 #15 10.06 + next-themes@0.4.6
2026-Jun-17 11:16:09.282648 #15 10.06 + prisma@6.19.2
2026-Jun-17 11:16:09.282648 #15 10.06 + react@19.2.3
2026-Jun-17 11:16:09.282648 #15 10.06 + react-day-picker@9.13.0
2026-Jun-17 11:16:09.282648 #15 10.06 + react-dom@19.2.3
2026-Jun-17 11:16:09.282648 #15 10.06 + react-hook-form@7.71.1
2026-Jun-17 11:16:09.282648 #15 10.06 + react-markdown@10.1.0
2026-Jun-17 11:16:09.282648 #15 10.06 + react-resizable-panels@3.0.6
2026-Jun-17 11:16:09.282648 #15 10.06 + react-syntax-highlighter@15.6.6
2026-Jun-17 11:16:09.282648 #15 10.06 + recharts@2.15.4
2026-Jun-17 11:16:09.282648 #15 10.06 + sharp@0.34.5
2026-Jun-17 11:16:09.282648 #15 10.06 + socket.io@4.8.3
2026-Jun-17 11:16:09.282648 #15 10.06 + socket.io-client@4.8.3
2026-Jun-17 11:16:09.282648 #15 10.06 + sonner@2.0.7
2026-Jun-17 11:16:09.282648 #15 10.06 + tailwind-merge@3.4.0
2026-Jun-17 11:16:09.282648 #15 10.06 + tailwindcss-animate@1.0.7
2026-Jun-17 11:16:09.282648 #15 10.06 + uuid@11.1.0
2026-Jun-17 11:16:09.282648 #15 10.06 + vaul@1.1.2
2026-Jun-17 11:16:09.282648 #15 10.06 + z-ai-web-dev-sdk@0.0.17
2026-Jun-17 11:16:09.282648 #15 10.06 + zod@4.3.5
2026-Jun-17 11:16:09.282648 #15 10.06 + zustand@5.0.10
2026-Jun-17 11:16:09.282648 #15 10.06
2026-Jun-17 11:16:09.282648 #15 10.06 847 packages installed [9.67s]
2026-Jun-17 11:16:09.816681 #15 DONE 10.4s
2026-Jun-17 11:16:20.148614 #18 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:16:20.148614 #18 CACHED
2026-Jun-17 11:16:20.252680 #18 [app builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:16:20.252680 #18 CACHED
2026-Jun-17 11:16:20.252680
2026-Jun-17 11:16:20.252680 #19 [app builder 4/6] COPY . .
2026-Jun-17 11:16:20.652801 #19 DONE 0.2s
2026-Jun-17 11:16:20.652801
2026-Jun-17 11:16:20.652801 #20 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:16:22.294209 #20 1.791 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 11:16:23.821785 #20 3.105
2026-Jun-17 11:16:23.821785 #20 3.105 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 411ms
2026-Jun-17 11:16:23.821785 #20 3.105
2026-Jun-17 11:16:23.821785 #20 3.105 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 11:16:23.821785 #20 3.105
2026-Jun-17 11:16:23.821785 #20 3.105 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
2026-Jun-17 11:16:23.821785 #20 3.105
2026-Jun-17 11:16:23.821785 #20 DONE 3.2s
2026-Jun-17 11:16:23.821785
2026-Jun-17 11:16:23.821785 #21 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 11:16:25.648370 #21 1.977 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 11:16:25.882364 #21 1.978
2026-Jun-17 11:16:25.882364 #21 2.061 Creating an optimized production build ...
2026-Jun-17 11:16:44.534503 #21 20.69 ✓ Compiled successfully in 17.8s
2026-Jun-17 11:16:44.534503 #21 20.69 Running TypeScript ...
2026-Jun-17 11:17:09.543360 #21 45.86 Collecting page data using 5 workers ...
2026-Jun-17 11:17:11.425903 #21 47.75 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 11:17:11.555948 #21 47.82 Generating static pages using 5 workers (28/113)
2026-Jun-17 11:17:11.555948 #21 47.88 Generating static pages using 5 workers (56/113)
2026-Jun-17 11:17:12.048033 #21 48.37 Generating static pages using 5 workers (84/113)
2026-Jun-17 11:17:12.208082 #21 48.38 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 11:17:12.208082 #21 48.38 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 11:17:12.208082 #21 48.38
2026-Jun-17 11:17:12.208082 #21 48.38
2026-Jun-17 11:17:12.208082 #21 48.38 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 11:17:12.208082 #21 48.38
2026-Jun-17 11:17:12.208082 #21 48.38 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 11:17:12.208082 #21 48.38 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 11:17:12.208082 #21 48.38 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 11:17:12.208082 #21 48.38 clientVersion: '6.19.2',
2026-Jun-17 11:17:12.208082 #21 48.38 errorCode: undefined,
2026-Jun-17 11:17:12.208082 #21 48.38 retryable: undefined
2026-Jun-17 11:17:12.208082 #21 48.38 }
2026-Jun-17 11:17:12.230832 #21 48.56 ✓ Generating static pages using 5 workers (113/113) in 805.0ms
2026-Jun-17 11:17:12.392841 #21 48.57 Finalizing page optimization ...
2026-Jun-17 11:17:13.031825 #21 49.36
2026-Jun-17 11:17:13.186036 #21 49.36 Route (app)
2026-Jun-17 11:17:13.186036 #21 49.36 ┌ ƒ /
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ○ /_not-found
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/cruceros
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/destinos
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/documentacion
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/excursiones
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/habitaciones
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/hoteles
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/login
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/marketing-modal
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/paquetes
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/resellers
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/reservas
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/revendedores
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/subagentes
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/transportes
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /admin/transportes/servicios
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/allotments
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/auth
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/auth/logout
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/bookings
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/cruises
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/destinations
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/excursions
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/help-articles
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/hotels
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/packages
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/rooms
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/stats
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/subagents
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/transport-providers
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/transport-services
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/upload
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/marketing-modal
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/booking
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/cruises
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/destinations
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/excursions
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/help-articles
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/hotels
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/packages
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/stats
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/public/transport
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/auth
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/catalog
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/clients
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/commissions
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/dashboard
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/packages
2026-Jun-17 11:17:13.186036 #21 49.36 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/products/transport
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/profile
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/register
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/sales
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/subagent/auth
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/subagent/bookings
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /api/upload
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /brand
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /contacto
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /cruceros
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /cruceros/[slug]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /destinos
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /destinos/[destinationId]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /excursiones
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /excursiones/[slug]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /hoteles
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /paquetes/[packageId]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /paquetes/armar
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog/packages
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/catalog/transport
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/clientes
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/comisiones
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/documentacion
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/login
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/productos
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/profile
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /reseller/register
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/settings
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/ventas
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/whitelabel
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /robots.txt
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /sitemap.xml
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /sobre-nosotros
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /subagent
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /subagent/clientes
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /subagent/comisiones
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /subagent/login
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /subagent/ventas
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ○ /transportes
2026-Jun-17 11:17:13.190607 #21 49.36 ├ ƒ /transportes/[serviceId]
2026-Jun-17 11:17:13.190607 #21 49.36 └ ƒ /uploads/[...path]
2026-Jun-17 11:17:13.190607 #21 49.36
2026-Jun-17 11:17:13.190607 #21 49.36
2026-Jun-17 11:17:13.190607 #21 49.36 ƒ Proxy (Middleware)
2026-Jun-17 11:17:13.190607 #21 49.36
2026-Jun-17 11:17:13.190607 #21 49.36 ○ (Static) prerendered as static content
2026-Jun-17 11:17:13.190607 #21 49.36 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 11:17:13.190607 #21 49.36
2026-Jun-17 11:17:13.496088 #21 DONE 49.7s
2026-Jun-17 11:17:13.830215 #22 [app runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:17:14.972822 #22 DONE 1.0s
2026-Jun-17 11:17:29.673328 #23 [migrate runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:17:30.114936 #23 DONE 0.3s
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #24 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:17:30.114936 #24 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #25 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:17:30.114936 #25 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #26 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 11:17:30.114936 #26 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #27 [migrate runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:17:30.114936 #27 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #28 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 11:17:30.114936 #28 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #29 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 11:17:30.114936 #29 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #30 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:17:30.114936 #30 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #31 [migrate builder 4/6] COPY . .
2026-Jun-17 11:17:30.114936 #31 CACHED
2026-Jun-17 11:17:30.114936
2026-Jun-17 11:17:30.114936 #32 [migrate runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:17:30.266486 #32 DONE 0.1s
2026-Jun-17 11:17:30.266486
2026-Jun-17 11:17:30.266486 #33 [app runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:17:42.015316 #33 DONE 11.8s
2026-Jun-17 11:17:42.015316
2026-Jun-17 11:17:42.015316 #34 [migrate runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:17:42.015316 #34 DONE 0.0s
2026-Jun-17 11:17:42.015316
2026-Jun-17 11:17:42.015316 #35 [migrate runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:17:42.015316 #35 DONE 0.0s
2026-Jun-17 11:17:42.015316
2026-Jun-17 11:17:42.015316 #36 [app runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:17:42.015316 #36 DONE 0.0s
2026-Jun-17 11:17:42.015316
2026-Jun-17 11:17:42.015316 #37 [app runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:17:42.195692 #37 DONE 0.0s
2026-Jun-17 11:17:42.195692
2026-Jun-17 11:17:42.195692 #38 [app runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:17:42.195692 #38 DONE 0.0s
2026-Jun-17 11:17:42.195692
2026-Jun-17 11:17:42.195692 #39 [app runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:17:42.536980 #39 DONE 0.3s
2026-Jun-17 11:17:42.536980
2026-Jun-17 11:17:42.536980 #40 [app] exporting to image
2026-Jun-17 11:17:42.536980 #40 exporting layers
2026-Jun-17 11:17:52.438078 #40 ...
2026-Jun-17 11:17:52.444328 #41 [migrate] exporting to image
2026-Jun-17 11:17:58.184510 #41 exporting layers 15.8s done
2026-Jun-17 11:17:58.342546 #41 writing image sha256:cacabdebd7c3811280dec1995f47a7a8117ba4bd675244fe6018c5d91fa791bc done
2026-Jun-17 11:17:58.342546 #41 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe done
2026-Jun-17 11:17:58.342546 #41 ...
2026-Jun-17 11:17:58.342546
2026-Jun-17 11:17:58.342546 #40 [app] exporting to image
2026-Jun-17 11:17:58.342546 #40 exporting layers 15.8s done
2026-Jun-17 11:17:58.342546 #40 writing image sha256:cacabdebd7c3811280dec1995f47a7a8117ba4bd675244fe6018c5d91fa791bc done
2026-Jun-17 11:17:58.342546 #40 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:1b28cf78d2a9aec66e34ed1d591c4fb3d3be77fe done
2026-Jun-17 11:17:59.836437 #40 DONE 17.5s
2026-Jun-17 11:17:59.836437
2026-Jun-17 11:17:59.836437 #41 [migrate] exporting to image
2026-Jun-17 11:17:59.911074 #41 DONE 17.5s
2026-Jun-17 11:17:59.911074
2026-Jun-17 11:17:59.911074 #42 [app] resolving provenance for metadata file
2026-Jun-17 11:17:59.911074 #42 DONE 0.0s
2026-Jun-17 11:17:59.911074
2026-Jun-17 11:17:59.911074 #43 [migrate] resolving provenance for metadata file
2026-Jun-17 11:17:59.911074 #43 DONE 0.0s
2026-Jun-17 11:17:59.915715 migrate Built
2026-Jun-17 11:17:59.915715 app Built
2026-Jun-17 11:18:00.020660 Creating .env file with runtime variables for container.
2026-Jun-17 11:18:00.325774 Removing old containers.
2026-Jun-17 11:18:00.570294 [CMD]: docker stop --time=30 app-u3lniscxtfk1klnak223ta5d-104911910987
2026-Jun-17 11:18:00.570294 app-u3lniscxtfk1klnak223ta5d-104911910987
2026-Jun-17 11:18:00.699397 [CMD]: docker rm -f app-u3lniscxtfk1klnak223ta5d-104911910987
2026-Jun-17 11:18:00.699397 app-u3lniscxtfk1klnak223ta5d-104911910987
2026-Jun-17 11:18:00.814935 [CMD]: docker stop --time=30 migrate-u3lniscxtfk1klnak223ta5d-104911901627
2026-Jun-17 11:18:00.814935 migrate-u3lniscxtfk1klnak223ta5d-104911901627
2026-Jun-17 11:18:00.941429 [CMD]: docker rm -f migrate-u3lniscxtfk1klnak223ta5d-104911901627
2026-Jun-17 11:18:00.941429 migrate-u3lniscxtfk1klnak223ta5d-104911901627
2026-Jun-17 11:18:00.947047 Starting new application.
2026-Jun-17 11:18:01.211965 [CMD]: docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/mqdn2cgy8wrw0ptm01kn4hm8 -f /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/docker-compose.yaml up -d'
2026-Jun-17 11:18:01.700966 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Creating
2026-Jun-17 11:18:01.893279 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Created
2026-Jun-17 11:18:01.898917 Container app-u3lniscxtfk1klnak223ta5d-111556417859 Creating
2026-Jun-17 11:18:01.917335 Container app-u3lniscxtfk1klnak223ta5d-111556417859 Created
2026-Jun-17 11:18:01.922978 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Starting
2026-Jun-17 11:18:02.656045 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Started
2026-Jun-17 11:18:02.656045 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Waiting
2026-Jun-17 11:18:21.158273 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:18:21.164079 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:18:21.164079 exit status 1
2026-Jun-17 11:18:21.226264 ========================================
2026-Jun-17 11:18:21.236179 Deployment failed: Command execution failed (exit code 1): docker exec mqdn2cgy8wrw0ptm01kn4hm8 bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/mqdn2cgy8wrw0ptm01kn4hm8 -f /artifacts/mqdn2cgy8wrw0ptm01kn4hm8/docker-compose.yaml up -d'
2026-Jun-17 11:18:21.236179 Error: Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Creating
2026-Jun-17 11:18:21.236179 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Created
2026-Jun-17 11:18:21.236179 Container app-u3lniscxtfk1klnak223ta5d-111556417859 Creating
2026-Jun-17 11:18:21.236179 Container app-u3lniscxtfk1klnak223ta5d-111556417859 Created
2026-Jun-17 11:18:21.236179 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Starting
2026-Jun-17 11:18:21.236179 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Started
2026-Jun-17 11:18:21.236179 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 Waiting
2026-Jun-17 11:18:21.236179 Container migrate-u3lniscxtfk1klnak223ta5d-111556409412 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:18:21.236179 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:18:21.236179 exit status 1
2026-Jun-17 11:18:21.247913 Error type: App\Exceptions\DeploymentException
2026-Jun-17 11:18:21.259128 Error code: 0
2026-Jun-17 11:18:21.269813 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 11:18:21.280113 Stack trace (first 5 lines):
2026-Jun-17 11:18:21.290704 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 11:18:21.300800 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 11:18:21.310852 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 11:18:21.319621 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 11:18:21.329658 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 11:18:21.340266 ========================================
2026-Jun-17 11:18:21.690616 Gracefully shutting down build container: mqdn2cgy8wrw0ptm01kn4hm8
2026-Jun-17 11:18:21.959265 [CMD]: docker stop --time=30 mqdn2cgy8wrw0ptm01kn4hm8
2026-Jun-17 11:18:21.959265 mqdn2cgy8wrw0ptm01kn4hm8
