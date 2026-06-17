2026-Jun-17 08:17:07.330273 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 08:17:07.340727 Starting deployment of wilrop-app to localhost.
2026-Jun-17 08:17:07.697156 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:17:07.844143 [CMD]: docker stop --time=30 w116s01vu0n1ej4nk6qb8lci
2026-Jun-17 08:17:07.844143 Error response from daemon: No such container: w116s01vu0n1ej4nk6qb8lci
2026-Jun-17 08:17:08.003903 [CMD]: docker run -d --network 'coolify' --name w116s01vu0n1ej4nk6qb8lci --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:17:08.003903 b34beb2e6fc83ba9208f9f01188664f3658b62ad4a505ee7a45a1d9b9ce5cded
2026-Jun-17 08:17:10.759619 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 08:17:10.759619 5222ceab859b601a39b2dac013e0ddc2c135f549 refs/heads/main
2026-Jun-17 08:17:10.895771 ----------------------------------------
2026-Jun-17 08:17:10.902847 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha 5222ceab859b601a39b2dac013e0ddc2c135f549) to /artifacts/w116s01vu0n1ej4nk6qb8lci.
2026-Jun-17 08:17:11.272396 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'mkdir -p /root/.ssh' && docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci > /dev/null' && docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci' && docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/w116s01vu0n1ej4nk6qb8lci'\'' && cd '\''/artifacts/w116s01vu0n1ej4nk6qb8lci'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''5222ceab859b601a39b2dac013e0ddc2c135f549'\'' && git -c advice.detachedHead=false checkout '\''5222ceab859b601a39b2dac013e0ddc2c135f549'\'' >/dev/null 2>&1 && cd '\''/artifacts/w116s01vu0n1ej4nk6qb8lci'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/w116s01vu0n1ej4nk6qb8lci'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_w116s01vu0n1ej4nk6qb8lci -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 08:17:11.272396 Cloning into '/artifacts/w116s01vu0n1ej4nk6qb8lci'...
2026-Jun-17 08:17:16.199489 From github.com:cambiodigital/wilrop
2026-Jun-17 08:17:16.199489 * branch 5222ceab859b601a39b2dac013e0ddc2c135f549 -> FETCH_HEAD
2026-Jun-17 08:17:18.093890 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'cd /artifacts/w116s01vu0n1ej4nk6qb8lci && git log -1 '\''5222ceab859b601a39b2dac013e0ddc2c135f549'\'' --pretty=%B'
2026-Jun-17 08:17:18.093890 build: simplify docker-compose configs and add commit guidelines
2026-Jun-17 08:17:18.093890
2026-Jun-17 08:17:18.093890 Add .trae/rules/git-commit-message.md with project commit message standards.
2026-Jun-17 08:17:18.093890 Update both docker-compose.yml and docker-compose.yaml:
2026-Jun-17 08:17:18.093890 remove mandatory variable check syntax from environment variables, simplify postgres healthcheck command, increase healthcheck retries from 5 to 10, and remove commented-out local postgres port mapping
2026-Jun-17 08:17:23.683648 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'test -f /artifacts/w116s01vu0n1ej4nk6qb8lci/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:17:23.683648 exists
2026-Jun-17 08:17:23.858468 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'cat /artifacts/w116s01vu0n1ej4nk6qb8lci/Dockerfile'
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 WORKDIR /app
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 COPY package.json bun.lock ./
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:17:23.858468 RUN bun install --frozen-lockfile
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 FROM node:22-alpine AS builder
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 WORKDIR /app
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:17:23.858468 COPY . .
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:17:23.858468 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # Compila Next.js en modo standalone;
2026-Jun-17 08:17:23.858468 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:17:23.858468 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:17:23.858468 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:17:23.858468 && cp -r public .next/standalone/
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:17:23.858468 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 FROM node:22-alpine AS runner
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 WORKDIR /app
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 ENV NODE_ENV=production
2026-Jun-17 08:17:23.858468 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:17:23.858468 ENV PORT=3000
2026-Jun-17 08:17:23.858468 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 RUN apk add --no-cache curl
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:17:23.858468 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:17:23.858468 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:17:23.858468 # Assets estáticos
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:17:23.858468 # Archivos públicos
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:17:23.858468 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:17:23.858468 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:17:23.858468 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:17:23.858468 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:23.858468 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:17:23.858468 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 USER nextjs
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 EXPOSE 3000
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 LABEL traefik.enable=true
2026-Jun-17 08:17:23.858468 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:17:23.858468 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:17:23.858468
2026-Jun-17 08:17:23.858468 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:17:23.858468 CMD ["web"]
2026-Jun-17 08:17:24.070177 Added 45 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 08:17:24.220143 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'test -f /artifacts/w116s01vu0n1ej4nk6qb8lci/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:17:24.220143 exists
2026-Jun-17 08:17:24.372039 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'cat /artifacts/w116s01vu0n1ej4nk6qb8lci/Dockerfile'
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:17:24.372039 ARG COOLIFY_FQDN
2026-Jun-17 08:17:24.372039 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_SECRET
2026-Jun-17 08:17:24.372039 ARG DATABASE_URL
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_URL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:17:24.372039 ARG PORT
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:17:24.372039 ARG POSTGRES_USER
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:17:24.372039 ARG POSTGRES_PASSWORD
2026-Jun-17 08:17:24.372039 ARG POSTGRES_DB
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 WORKDIR /app
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 COPY package.json bun.lock ./
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:17:24.372039 RUN bun install --frozen-lockfile
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 FROM node:22-alpine AS builder
2026-Jun-17 08:17:24.372039 ARG COOLIFY_FQDN
2026-Jun-17 08:17:24.372039 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_SECRET
2026-Jun-17 08:17:24.372039 ARG DATABASE_URL
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_URL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:17:24.372039 ARG PORT
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:17:24.372039 ARG POSTGRES_USER
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:17:24.372039 ARG POSTGRES_PASSWORD
2026-Jun-17 08:17:24.372039 ARG POSTGRES_DB
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 WORKDIR /app
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:17:24.372039 COPY . .
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:17:24.372039 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # Compila Next.js en modo standalone;
2026-Jun-17 08:17:24.372039 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:17:24.372039 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:17:24.372039 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:17:24.372039 && cp -r public .next/standalone/
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:17:24.372039 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 FROM node:22-alpine AS runner
2026-Jun-17 08:17:24.372039 ARG COOLIFY_FQDN
2026-Jun-17 08:17:24.372039 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_SECRET
2026-Jun-17 08:17:24.372039 ARG DATABASE_URL
2026-Jun-17 08:17:24.372039 ARG NEXTAUTH_URL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:17:24.372039 ARG PORT
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:17:24.372039 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:17:24.372039 ARG POSTGRES_USER
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:17:24.372039 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:17:24.372039 ARG POSTGRES_PASSWORD
2026-Jun-17 08:17:24.372039 ARG POSTGRES_DB
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 WORKDIR /app
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 ENV NODE_ENV=production
2026-Jun-17 08:17:24.372039 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:17:24.372039 ENV PORT=3000
2026-Jun-17 08:17:24.372039 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 RUN apk add --no-cache curl
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:17:24.372039 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:17:24.372039 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:17:24.372039 # Assets estáticos
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:17:24.372039 # Archivos públicos
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:17:24.372039 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:17:24.372039 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:17:24.372039 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:17:24.372039 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:17:24.372039 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:17:24.372039 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 USER nextjs
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 EXPOSE 3000
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 LABEL traefik.enable=true
2026-Jun-17 08:17:24.372039 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:17:24.372039 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:17:24.372039
2026-Jun-17 08:17:24.372039 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:17:24.372039 CMD ["web"]
2026-Jun-17 08:17:24.379296 Service app: All required ARG declarations already exist.
2026-Jun-17 08:17:24.386259 Pulling & building required images.
2026-Jun-17 08:17:24.460275 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 08:17:24.634189 Adding build arguments to Docker Compose build command.
2026-Jun-17 08:17:25.083527 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/w116s01vu0n1ej4nk6qb8lci -f /artifacts/w116s01vu0n1ej4nk6qb8lci/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg POSTGRES_USER --build-arg WILROP_ADMIN_EMAIL --build-arg WILROP_ADMIN_NAME --build-arg POSTGRES_PASSWORD --build-arg POSTGRES_DB --build-arg COOLIFY_BUILD_SECRETS_HASH=ef20a813fe2305934d75364a8ce17c2125132273e3df52886a6f21b8009277e5'
2026-Jun-17 08:17:25.083527 #1 [internal] load local bake definitions
2026-Jun-17 08:17:25.330966 #1 reading from stdin 2.83kB done
2026-Jun-17 08:17:25.330966 #1 DONE 0.0s
2026-Jun-17 08:17:25.330966
2026-Jun-17 08:17:25.330966 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 08:17:25.330966 #2 transferring dockerfile: 5.61kB done
2026-Jun-17 08:17:25.330966 #2 DONE 0.0s
2026-Jun-17 08:17:25.330966
2026-Jun-17 08:17:25.330966 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 08:17:25.330966 #3 transferring dockerfile: 5.61kB done
2026-Jun-17 08:17:25.330966 #3 DONE 0.0s
2026-Jun-17 08:17:25.330966
2026-Jun-17 08:17:25.330966 #4 [migrate internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 08:17:25.981250 #4 DONE 0.7s
2026-Jun-17 08:17:25.981250
2026-Jun-17 08:17:25.981250 #5 [app internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 08:17:26.131338 #5 DONE 0.8s
2026-Jun-17 08:17:26.131338
2026-Jun-17 08:17:26.131338 #6 [app internal] load .dockerignore
2026-Jun-17 08:17:26.131338 #6 transferring context: 1.12kB done
2026-Jun-17 08:17:26.131338 #6 DONE 0.0s
2026-Jun-17 08:17:26.131338
2026-Jun-17 08:17:26.131338 #7 [migrate internal] load .dockerignore
2026-Jun-17 08:17:26.131338 #7 transferring context: 1.12kB done
2026-Jun-17 08:17:26.131338 #7 DONE 0.0s
2026-Jun-17 08:17:26.131338
2026-Jun-17 08:17:26.131338 #8 [migrate builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 08:17:26.131338 #8 DONE 0.0s
2026-Jun-17 08:17:26.131338
2026-Jun-17 08:17:26.131338 #9 [migrate deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 08:17:26.131338 #9 DONE 0.0s
2026-Jun-17 08:17:26.131338
2026-Jun-17 08:17:26.131338 #10 [app internal] load build context
2026-Jun-17 08:17:26.231501 #10 transferring context: 12.08MB 0.2s done
2026-Jun-17 08:17:26.231501 #10 DONE 0.2s
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #11 [migrate internal] load build context
2026-Jun-17 08:17:26.231501 #11 transferring context: 12.08MB 0.2s done
2026-Jun-17 08:17:26.231501 #11 DONE 0.2s
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #12 [migrate builder 2/6] WORKDIR /app
2026-Jun-17 08:17:26.231501 #12 CACHED
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #13 [app deps 2/4] WORKDIR /app
2026-Jun-17 08:17:26.231501 #13 CACHED
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #14 [app deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 08:17:26.231501 #14 CACHED
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #15 [app deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 08:17:26.231501 #15 CACHED
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #16 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:17:26.231501 #16 CACHED
2026-Jun-17 08:17:26.231501
2026-Jun-17 08:17:26.231501 #17 [migrate builder 4/6] COPY . .
2026-Jun-17 08:17:26.556094 #17 DONE 0.2s
2026-Jun-17 08:17:26.556094
2026-Jun-17 08:17:26.556094 #18 [app builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:17:27.941266 #18 1.536 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 08:17:29.375325 #18 2.764
2026-Jun-17 08:17:29.375325 #18 2.764 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 403ms
2026-Jun-17 08:17:29.375325 #18 2.764
2026-Jun-17 08:17:29.375325 #18 2.764 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 08:17:29.375325 #18 2.764
2026-Jun-17 08:17:29.375325 #18 2.764 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
2026-Jun-17 08:17:29.375325 #18 2.764
2026-Jun-17 08:17:29.375325 #18 DONE 2.8s
2026-Jun-17 08:17:29.375325
2026-Jun-17 08:17:29.375325 #19 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 08:17:30.866168 #19 1.642 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 08:17:31.089130 #19 1.643
2026-Jun-17 08:17:31.089130 #19 1.715 Creating an optimized production build ...
2026-Jun-17 08:17:47.988625 #19 18.74 ✓ Compiled successfully in 16.3s
2026-Jun-17 08:17:47.988625 #19 18.74 Running TypeScript ...
2026-Jun-17 08:18:12.123142 #19 42.88 Collecting page data using 5 workers ...
2026-Jun-17 08:18:13.811904 #19 44.59 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 08:18:13.954268 #19 44.66 Generating static pages using 5 workers (28/113)
2026-Jun-17 08:18:13.954268 #19 44.73 Generating static pages using 5 workers (56/113)
2026-Jun-17 08:18:14.493886 #19 45.27 Generating static pages using 5 workers (84/113)
2026-Jun-17 08:18:14.687531 #19 45.31 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 08:18:14.687531 #19 45.31 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 08:18:14.687531 #19 45.31
2026-Jun-17 08:18:14.687531 #19 45.31
2026-Jun-17 08:18:14.687531 #19 45.31 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 08:18:14.687531 #19 45.31
2026-Jun-17 08:18:14.687531 #19 45.31 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 08:18:14.687531 #19 45.31 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 08:18:14.687531 #19 45.31 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 08:18:14.687531 #19 45.31 clientVersion: '6.19.2',
2026-Jun-17 08:18:14.687531 #19 45.31 errorCode: undefined,
2026-Jun-17 08:18:14.687531 #19 45.31 retryable: undefined
2026-Jun-17 08:18:14.687531 #19 45.31 }
2026-Jun-17 08:18:14.779018 #19 45.55 ✓ Generating static pages using 5 workers (113/113) in 966.7ms
2026-Jun-17 08:18:14.947118 #19 45.57 Finalizing page optimization ...
2026-Jun-17 08:18:15.864527 #19 46.48
2026-Jun-17 08:18:15.864527 #19 46.49 Route (app)
2026-Jun-17 08:18:15.864527 #19 46.49 ┌ ƒ /
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /_not-found
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/cruceros
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/destinos
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/documentacion
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/excursiones
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/habitaciones
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/hoteles
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/login
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/marketing-modal
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/paquetes
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/resellers
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/reservas
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/revendedores
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/subagentes
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/transportes
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /admin/transportes/servicios
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/allotments
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/auth
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/auth/logout
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/bookings
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/cruises
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/destinations
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/excursions
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/help-articles
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/hotels
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/packages
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/rooms
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/stats
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/subagents
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/transport-providers
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/transport-services
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/upload
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/marketing-modal
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/booking
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/cruises
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/destinations
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/excursions
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/help-articles
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/hotels
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/packages
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/stats
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/public/transport
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/auth
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/catalog
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/clients
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/commissions
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/dashboard
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/packages
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/transport
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/profile
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/register
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/sales
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/subagent/auth
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/subagent/bookings
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /api/upload
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /brand
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /contacto
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /cruceros
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /cruceros/[slug]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /destinos
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /destinos/[destinationId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /excursiones
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /excursiones/[slug]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /hoteles
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /paquetes/[packageId]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ○ /paquetes/armar
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 08:18:15.864527 #19 46.49 ├ ƒ /reseller
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog/packages
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/catalog/transport
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/clientes
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/comisiones
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/documentacion
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/login
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/productos
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/profile
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ○ /reseller/register
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/settings
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/ventas
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/whitelabel
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ○ /robots.txt
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ○ /sitemap.xml
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ○ /sobre-nosotros
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /subagent
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /subagent/clientes
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /subagent/comisiones
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /subagent/login
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /subagent/ventas
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ○ /transportes
2026-Jun-17 08:18:15.869219 #19 46.49 ├ ƒ /transportes/[serviceId]
2026-Jun-17 08:18:15.869219 #19 46.49 └ ƒ /uploads/[...path]
2026-Jun-17 08:18:15.869219 #19 46.49
2026-Jun-17 08:18:15.869219 #19 46.49
2026-Jun-17 08:18:15.869219 #19 46.49 ƒ Proxy (Middleware)
2026-Jun-17 08:18:15.869219 #19 46.49
2026-Jun-17 08:18:15.869219 #19 46.49 ○ (Static) prerendered as static content
2026-Jun-17 08:18:15.869219 #19 46.49 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 08:18:15.869219 #19 46.49
2026-Jun-17 08:18:16.169511 #19 DONE 46.8s
2026-Jun-17 08:18:32.302240 #20 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 08:18:32.302240 #20 CACHED
2026-Jun-17 08:18:32.302240
2026-Jun-17 08:18:32.302240 #21 [app runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 08:18:32.302240 #21 CACHED
2026-Jun-17 08:18:32.302240
2026-Jun-17 08:18:32.302240 #22 [app runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:18:32.451875 #22 ...
2026-Jun-17 08:18:32.451875
2026-Jun-17 08:18:32.451875 #20 [migrate runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 08:18:32.451875 #20 CACHED
2026-Jun-17 08:18:32.451875
2026-Jun-17 08:18:32.451875 #21 [migrate runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 08:18:32.451875 #21 CACHED
2026-Jun-17 08:18:32.451875
2026-Jun-17 08:18:32.451875 #22 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:18:33.825229 #22 DONE 1.4s
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #23 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:18:33.825229 #23 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #24 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:18:33.825229 #24 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #25 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 08:18:33.825229 #25 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #26 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 08:18:33.825229 #26 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #27 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 08:18:33.825229 #27 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #28 [migrate builder 4/6] COPY . .
2026-Jun-17 08:18:33.825229 #28 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #29 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:18:33.825229 #29 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #13 [migrate deps 2/4] WORKDIR /app
2026-Jun-17 08:18:33.825229 #13 CACHED
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #30 [app runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:18:33.825229 #30 DONE 0.1s
2026-Jun-17 08:18:33.825229
2026-Jun-17 08:18:33.825229 #31 [app runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:18:33.978473 #31 DONE 0.1s
2026-Jun-17 08:18:33.978473
2026-Jun-17 08:18:33.978473 #32 [migrate runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:18:46.718997 #32 DONE 12.8s
2026-Jun-17 08:18:46.718997
2026-Jun-17 08:18:46.718997 #33 [app runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:18:46.718997 #33 DONE 0.0s
2026-Jun-17 08:18:46.718997
2026-Jun-17 08:18:46.718997 #34 [app runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:18:46.718997 #34 DONE 0.0s
2026-Jun-17 08:18:46.718997
2026-Jun-17 08:18:46.718997 #35 [migrate runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:18:46.718997 #35 DONE 0.0s
2026-Jun-17 08:18:46.718997
2026-Jun-17 08:18:46.718997 #36 [app runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:18:46.893976 #36 DONE 0.0s
2026-Jun-17 08:18:46.893976
2026-Jun-17 08:18:46.893976 #37 [app runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:18:46.893976 #37 DONE 0.0s
2026-Jun-17 08:18:46.893976
2026-Jun-17 08:18:46.893976 #38 [app runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:18:47.240602 #38 DONE 0.3s
2026-Jun-17 08:18:47.240602
2026-Jun-17 08:18:47.240602 #39 [migrate] exporting to image
2026-Jun-17 08:18:47.240602 #39 exporting layers
2026-Jun-17 08:18:57.140400 #39 ...
2026-Jun-17 08:18:57.140400
2026-Jun-17 08:18:57.140400 #40 [app] exporting to image
2026-Jun-17 08:19:02.909482 #40 ...
2026-Jun-17 08:19:02.909482
2026-Jun-17 08:19:02.909482 #39 [migrate] exporting to image
2026-Jun-17 08:19:02.914656 #39 exporting layers 15.8s done
2026-Jun-17 08:19:03.065975 #39 writing image sha256:807b5fa36e9034f1172350faaa666b11231f3ee0f3f5f20a49bc7f2813f3043f done
2026-Jun-17 08:19:03.065975 #39 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:5222ceab859b601a39b2dac013e0ddc2c135f549 done
2026-Jun-17 08:19:03.551400 #39 DONE 16.5s
2026-Jun-17 08:19:03.551400
2026-Jun-17 08:19:03.551400 #40 [app] exporting to image
2026-Jun-17 08:19:03.551400 #40 exporting layers 15.8s done
2026-Jun-17 08:19:03.551400 #40 writing image sha256:807b5fa36e9034f1172350faaa666b11231f3ee0f3f5f20a49bc7f2813f3043f done
2026-Jun-17 08:19:03.551400 #40 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:5222ceab859b601a39b2dac013e0ddc2c135f549 done
2026-Jun-17 08:19:03.641510 #40 DONE 16.5s
2026-Jun-17 08:19:03.641510
2026-Jun-17 08:19:03.641510 #41 [app] resolving provenance for metadata file
2026-Jun-17 08:19:03.641510 #41 DONE 0.0s
2026-Jun-17 08:19:03.641510
2026-Jun-17 08:19:03.641510 #42 [migrate] resolving provenance for metadata file
2026-Jun-17 08:19:03.641510 #42 DONE 0.0s
2026-Jun-17 08:19:03.646186 app Built
2026-Jun-17 08:19:03.646186 migrate Built
2026-Jun-17 08:19:03.780207 Creating .env file with runtime variables for container.
2026-Jun-17 08:19:04.927908 Removing old containers.
2026-Jun-17 08:19:05.210712 [CMD]: docker stop --time=30 app-u3lniscxtfk1klnak223ta5d-081051791495
2026-Jun-17 08:19:05.210712 app-u3lniscxtfk1klnak223ta5d-081051791495
2026-Jun-17 08:19:05.356419 [CMD]: docker rm -f app-u3lniscxtfk1klnak223ta5d-081051791495
2026-Jun-17 08:19:05.356419 app-u3lniscxtfk1klnak223ta5d-081051791495
2026-Jun-17 08:19:05.488060 [CMD]: docker stop --time=30 migrate-u3lniscxtfk1klnak223ta5d-081051784948
2026-Jun-17 08:19:05.488060 migrate-u3lniscxtfk1klnak223ta5d-081051784948
2026-Jun-17 08:19:05.628496 [CMD]: docker rm -f migrate-u3lniscxtfk1klnak223ta5d-081051784948
2026-Jun-17 08:19:05.628496 migrate-u3lniscxtfk1klnak223ta5d-081051784948
2026-Jun-17 08:19:06.152115 [CMD]: docker stop --time=30 db-u3lniscxtfk1klnak223ta5d-081051799419
2026-Jun-17 08:19:06.152115 db-u3lniscxtfk1klnak223ta5d-081051799419
2026-Jun-17 08:19:06.300001 [CMD]: docker rm -f db-u3lniscxtfk1klnak223ta5d-081051799419
2026-Jun-17 08:19:06.300001 db-u3lniscxtfk1klnak223ta5d-081051799419
2026-Jun-17 08:19:06.305156 Starting new application.
2026-Jun-17 08:19:06.604943 [CMD]: docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/w116s01vu0n1ej4nk6qb8lci/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/w116s01vu0n1ej4nk6qb8lci -f /artifacts/w116s01vu0n1ej4nk6qb8lci/docker-compose.yaml up -d'
2026-Jun-17 08:19:07.049742 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Creating
2026-Jun-17 08:19:07.081961 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Created
2026-Jun-17 08:19:07.086362 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Creating
2026-Jun-17 08:19:07.117659 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Created
2026-Jun-17 08:19:07.117659 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Creating
2026-Jun-17 08:19:07.140788 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Created
2026-Jun-17 08:19:07.145715 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Starting
2026-Jun-17 08:19:07.913652 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Started
2026-Jun-17 08:19:07.913652 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Waiting
2026-Jun-17 08:19:18.415452 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Healthy
2026-Jun-17 08:19:18.415452 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Starting
2026-Jun-17 08:19:18.951320 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Started
2026-Jun-17 08:19:18.951320 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Waiting
2026-Jun-17 08:19:18.951320 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Waiting
2026-Jun-17 08:19:19.453179 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Healthy
2026-Jun-17 08:19:23.001329 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Exited
2026-Jun-17 08:19:23.001329 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Starting
2026-Jun-17 08:19:23.115852 Error response from daemon: driver failed programming external connectivity on endpoint app-u3lniscxtfk1klnak223ta5d-081723336123 (5a1999e028a5c0851e8ee73d83df1f4f0ecc004425d13d8c0acc7a3f1f08db9c): Bind for 0.0.0.0:3000 failed: port is already allocated
2026-Jun-17 08:19:23.121674 exit status 1
2026-Jun-17 08:19:23.196865 ========================================
2026-Jun-17 08:19:23.205641 Deployment failed: Command execution failed (exit code 1): docker exec w116s01vu0n1ej4nk6qb8lci bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/w116s01vu0n1ej4nk6qb8lci/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/w116s01vu0n1ej4nk6qb8lci -f /artifacts/w116s01vu0n1ej4nk6qb8lci/docker-compose.yaml up -d'
2026-Jun-17 08:19:23.205641 Error: Container db-u3lniscxtfk1klnak223ta5d-081723346185 Creating
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Created
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Creating
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Created
2026-Jun-17 08:19:23.205641 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Creating
2026-Jun-17 08:19:23.205641 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Created
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Starting
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Started
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Waiting
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Healthy
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Starting
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Started
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Waiting
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Waiting
2026-Jun-17 08:19:23.205641 Container db-u3lniscxtfk1klnak223ta5d-081723346185 Healthy
2026-Jun-17 08:19:23.205641 Container migrate-u3lniscxtfk1klnak223ta5d-081723328816 Exited
2026-Jun-17 08:19:23.205641 Container app-u3lniscxtfk1klnak223ta5d-081723336123 Starting
2026-Jun-17 08:19:23.205641 Error response from daemon: driver failed programming external connectivity on endpoint app-u3lniscxtfk1klnak223ta5d-081723336123 (5a1999e028a5c0851e8ee73d83df1f4f0ecc004425d13d8c0acc7a3f1f08db9c): Bind for 0.0.0.0:3000 failed: port is already allocated
2026-Jun-17 08:19:23.205641 exit status 1
2026-Jun-17 08:19:23.215768 Error type: App\Exceptions\DeploymentException
2026-Jun-17 08:19:23.224291 Error code: 0
2026-Jun-17 08:19:23.233110 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 08:19:23.241999 Stack trace (first 5 lines):
2026-Jun-17 08:19:23.250050 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 08:19:23.258184 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 08:19:23.266210 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 08:19:23.284456 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 08:19:23.292344 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 08:19:23.302174 ========================================
2026-Jun-17 08:19:23.631076 Gracefully shutting down build container: w116s01vu0n1ej4nk6qb8lci
2026-Jun-17 08:19:23.874736 [CMD]: docker stop --time=30 w116s01vu0n1ej4nk6qb8lci
2026-Jun-17 08:19:23.874736 w116s01vu0n1ej4nk6qb8lci
