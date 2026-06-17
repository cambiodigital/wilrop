2026-Jun-17 10:48:56.676344 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 10:48:56.683463 Starting deployment of wilrop-app to localhost.
2026-Jun-17 10:48:56.981410 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 10:48:57.095843 [CMD]: docker stop --time=30 z5b5g5wuc5d16dbrkfwlxaw2
2026-Jun-17 10:48:57.095843 Error response from daemon: No such container: z5b5g5wuc5d16dbrkfwlxaw2
2026-Jun-17 10:48:57.230153 [CMD]: docker run -d --network 'coolify' --name z5b5g5wuc5d16dbrkfwlxaw2 --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 10:48:57.230153 131e7f6ee7827c662be4c416a830fe2da1bbce1eb26ba802b2d63b21ea73f378
2026-Jun-17 10:48:59.733983 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 10:48:59.733983 0786813d2341981e7d715989c4f1331959e7f716 refs/heads/main
2026-Jun-17 10:48:59.871605 ----------------------------------------
2026-Jun-17 10:48:59.878117 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha 0786813d2341981e7d715989c4f1331959e7f716) to /artifacts/z5b5g5wuc5d16dbrkfwlxaw2.
2026-Jun-17 10:49:00.157158 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'mkdir -p /root/.ssh' && docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 > /dev/null' && docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2' && docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/z5b5g5wuc5d16dbrkfwlxaw2'\'' && cd '\''/artifacts/z5b5g5wuc5d16dbrkfwlxaw2'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''0786813d2341981e7d715989c4f1331959e7f716'\'' && git -c advice.detachedHead=false checkout '\''0786813d2341981e7d715989c4f1331959e7f716'\'' >/dev/null 2>&1 && cd '\''/artifacts/z5b5g5wuc5d16dbrkfwlxaw2'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/z5b5g5wuc5d16dbrkfwlxaw2'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_z5b5g5wuc5d16dbrkfwlxaw2 -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 10:49:00.157158 Cloning into '/artifacts/z5b5g5wuc5d16dbrkfwlxaw2'...
2026-Jun-17 10:49:04.876539 From github.com:cambiodigital/wilrop
2026-Jun-17 10:49:04.876539 * branch 0786813d2341981e7d715989c4f1331959e7f716 -> FETCH_HEAD
2026-Jun-17 10:49:06.719786 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'cd /artifacts/z5b5g5wuc5d16dbrkfwlxaw2 && git log -1 '\''0786813d2341981e7d715989c4f1331959e7f716'\'' --pretty=%B'
2026-Jun-17 10:49:06.719786 chore(docker-compose): remove embedded postgres service and update db config
2026-Jun-17 10:49:06.719786
2026-Jun-17 10:49:06.719786 switch to using external ${DATABASE_URL} instead of built-in connection string
2026-Jun-17 10:49:06.719786 remove standalone postgres service and its associated volume
2026-Jun-17 10:49:06.719786 clean up unused depends_on conditions and redundant comments
2026-Jun-17 10:49:06.719786 apply changes to both docker-compose.yml and docker-compose.yaml
2026-Jun-17 10:49:12.239473 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'test -f /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 10:49:12.239473 exists
2026-Jun-17 10:49:12.406411 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'cat /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/Dockerfile'
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 FROM oven/bun:1-alpine AS deps
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 WORKDIR /app
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 COPY package.json bun.lock ./
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 10:49:12.406411 RUN bun install --frozen-lockfile
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 FROM node:22-alpine AS builder
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 WORKDIR /app
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 10:49:12.406411 COPY . .
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 10:49:12.406411 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # Compila Next.js en modo standalone;
2026-Jun-17 10:49:12.406411 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 10:49:12.406411 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 10:49:12.406411 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 10:49:12.406411 && cp -r public .next/standalone/
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 10:49:12.406411 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 FROM node:22-alpine AS runner
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 WORKDIR /app
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 ENV NODE_ENV=production
2026-Jun-17 10:49:12.406411 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 10:49:12.406411 ENV PORT=3000
2026-Jun-17 10:49:12.406411 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 RUN apk add --no-cache curl
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 10:49:12.406411 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 10:49:12.406411 && adduser --system --uid 1001 nextjs
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 10:49:12.406411 # Assets estáticos
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 10:49:12.406411 # Archivos públicos
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 10:49:12.406411 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 10:49:12.406411 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 10:49:12.406411 # Scripts operativos usados por el entrypoint
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 10:49:12.406411 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.406411 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 10:49:12.406411 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 USER nextjs
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 EXPOSE 3000
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 LABEL traefik.enable=true
2026-Jun-17 10:49:12.406411 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 10:49:12.406411 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 10:49:12.406411
2026-Jun-17 10:49:12.406411 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 10:49:12.406411 CMD ["web"]
2026-Jun-17 10:49:12.585671 Added 36 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 10:49:12.747172 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'test -f /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 10:49:12.747172 exists
2026-Jun-17 10:49:12.912893 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'cat /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/Dockerfile'
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 FROM oven/bun:1-alpine AS deps
2026-Jun-17 10:49:12.912893 ARG COOLIFY_FQDN
2026-Jun-17 10:49:12.912893 ARG WILROP_SESSION_SECRET
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_SECRET
2026-Jun-17 10:49:12.912893 ARG DATABASE_URL
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_URL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 10:49:12.912893 ARG PORT
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_NAME
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 WORKDIR /app
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 COPY package.json bun.lock ./
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 10:49:12.912893 RUN bun install --frozen-lockfile
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 FROM node:22-alpine AS builder
2026-Jun-17 10:49:12.912893 ARG COOLIFY_FQDN
2026-Jun-17 10:49:12.912893 ARG WILROP_SESSION_SECRET
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_SECRET
2026-Jun-17 10:49:12.912893 ARG DATABASE_URL
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_URL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 10:49:12.912893 ARG PORT
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_NAME
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 WORKDIR /app
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 10:49:12.912893 COPY . .
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 10:49:12.912893 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # Compila Next.js en modo standalone;
2026-Jun-17 10:49:12.912893 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 10:49:12.912893 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 10:49:12.912893 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 10:49:12.912893 && cp -r public .next/standalone/
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 10:49:12.912893 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 FROM node:22-alpine AS runner
2026-Jun-17 10:49:12.912893 ARG COOLIFY_FQDN
2026-Jun-17 10:49:12.912893 ARG WILROP_SESSION_SECRET
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_SECRET
2026-Jun-17 10:49:12.912893 ARG DATABASE_URL
2026-Jun-17 10:49:12.912893 ARG NEXTAUTH_URL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 10:49:12.912893 ARG PORT
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 10:49:12.912893 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 10:49:12.912893 ARG WILROP_ADMIN_NAME
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 WORKDIR /app
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 ENV NODE_ENV=production
2026-Jun-17 10:49:12.912893 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 10:49:12.912893 ENV PORT=3000
2026-Jun-17 10:49:12.912893 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 RUN apk add --no-cache curl
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 10:49:12.912893 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 10:49:12.912893 && adduser --system --uid 1001 nextjs
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 10:49:12.912893 # Assets estáticos
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 10:49:12.912893 # Archivos públicos
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 10:49:12.912893 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 10:49:12.912893 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 10:49:12.912893 # Scripts operativos usados por el entrypoint
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 10:49:12.912893 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 10:49:12.912893 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 10:49:12.912893 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 USER nextjs
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 EXPOSE 3000
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 LABEL traefik.enable=true
2026-Jun-17 10:49:12.912893 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 10:49:12.912893 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 10:49:12.912893
2026-Jun-17 10:49:12.912893 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 10:49:12.912893 CMD ["web"]
2026-Jun-17 10:49:12.920889 Service app: All required ARG declarations already exist.
2026-Jun-17 10:49:12.929576 Pulling & building required images.
2026-Jun-17 10:49:13.000882 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 10:49:13.175393 Adding build arguments to Docker Compose build command.
2026-Jun-17 10:49:13.600848 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/z5b5g5wuc5d16dbrkfwlxaw2 -f /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg WILROP_ADMIN_EMAIL --build-arg WILROP_ADMIN_NAME --build-arg COOLIFY_BUILD_SECRETS_HASH=65ad93702e6059d8eb7a8d6579a3a74fbf6d0d6ff60a223b2a9253c29613a104'
2026-Jun-17 10:49:13.600848 #1 [internal] load local bake definitions
2026-Jun-17 10:49:13.851304 #1 reading from stdin 2.50kB done
2026-Jun-17 10:49:13.851304 #1 DONE 0.0s
2026-Jun-17 10:49:13.851304
2026-Jun-17 10:49:13.851304 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 10:49:13.851304 #2 transferring dockerfile: 5.44kB done
2026-Jun-17 10:49:13.851304 #2 DONE 0.0s
2026-Jun-17 10:49:13.851304
2026-Jun-17 10:49:13.851304 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 10:49:13.851304 #3 transferring dockerfile: 5.44kB done
2026-Jun-17 10:49:13.851304 #3 DONE 0.0s
2026-Jun-17 10:49:13.851304
2026-Jun-17 10:49:13.851304 #4 [migrate internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 10:49:14.509335 #4 DONE 0.7s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #5 [migrate internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 10:49:14.509335 #5 DONE 0.6s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #6 [migrate internal] load .dockerignore
2026-Jun-17 10:49:14.509335 #6 transferring context: 1.12kB done
2026-Jun-17 10:49:14.509335 #6 DONE 0.0s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #7 [app internal] load .dockerignore
2026-Jun-17 10:49:14.509335 #7 transferring context: 1.12kB done
2026-Jun-17 10:49:14.509335 #7 DONE 0.0s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #8 [app builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 10:49:14.509335 #8 DONE 0.0s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #9 [app deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 10:49:14.509335 #9 DONE 0.0s
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #10 [app builder 2/6] WORKDIR /app
2026-Jun-17 10:49:14.509335 #10 CACHED
2026-Jun-17 10:49:14.509335
2026-Jun-17 10:49:14.509335 #11 [migrate internal] load build context
2026-Jun-17 10:49:14.808187 #11 transferring context: 12.05MB 0.4s done
2026-Jun-17 10:49:14.808187 #11 DONE 0.4s
2026-Jun-17 10:49:14.808187
2026-Jun-17 10:49:14.808187 #12 [app internal] load build context
2026-Jun-17 10:49:14.808187 #12 transferring context: 12.05MB 0.4s done
2026-Jun-17 10:49:14.808187 #12 DONE 0.4s
2026-Jun-17 10:49:14.808187
2026-Jun-17 10:49:14.808187 #13 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 10:49:14.982289 #13 ...
2026-Jun-17 10:49:14.982289
2026-Jun-17 10:49:14.982289 #14 [migrate deps 2/4] WORKDIR /app
2026-Jun-17 10:49:14.982289 #14 CACHED
2026-Jun-17 10:49:14.982289
2026-Jun-17 10:49:14.982289 #15 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 10:49:14.982289 #15 CACHED
2026-Jun-17 10:49:15.126420 #16 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 10:49:15.133445 #16 0.315 bun install v1.3.14 (0d9b296a)
2026-Jun-17 10:49:17.111098 #16 ...
2026-Jun-17 10:49:17.111098
2026-Jun-17 10:49:17.111098 #13 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 10:49:17.111098 #13 1.143 (1/9) Installing brotli-libs (1.2.0-r1)
2026-Jun-17 10:49:17.111098 #13 1.211 (2/9) Installing c-ares (1.34.6-r0)
2026-Jun-17 10:49:17.111098 #13 1.244 (3/9) Installing libunistring (1.4.2-r0)
2026-Jun-17 10:49:17.111098 #13 1.303 (4/9) Installing libidn2 (2.3.8-r0)
2026-Jun-17 10:49:17.111098 #13 1.339 (5/9) Installing nghttp2-libs (1.69.0-r0)
2026-Jun-17 10:49:17.111098 #13 1.376 (6/9) Installing libpsl (0.21.5-r3)
2026-Jun-17 10:49:17.111098 #13 1.409 (7/9) Installing zstd-libs (1.5.7-r2)
2026-Jun-17 10:49:17.111098 #13 1.454 (8/9) Installing libcurl (8.20.0-r1)
2026-Jun-17 10:49:17.111098 #13 1.503 (9/9) Installing curl (8.20.0-r1)
2026-Jun-17 10:49:17.111098 #13 1.555 Executing busybox-1.37.0-r31.trigger
2026-Jun-17 10:49:17.111098 #13 1.605 OK: 15.9 MiB in 27 packages
2026-Jun-17 10:49:17.111098 #13 DONE 2.6s
2026-Jun-17 10:49:17.260983 #17 [app runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 10:49:18.220342 #17 DONE 1.1s
2026-Jun-17 10:49:18.220342
2026-Jun-17 10:49:18.220342 #16 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 10:49:23.773724 #16 8.805
2026-Jun-17 10:49:23.773724 #16 8.805 + @tailwindcss/postcss@4.1.18
2026-Jun-17 10:49:23.773724 #16 8.805 + @types/react@19.2.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @types/react-dom@19.2.3
2026-Jun-17 10:49:23.773724 #16 8.805 + bun-types@1.3.6
2026-Jun-17 10:49:23.773724 #16 8.805 + eslint@9.39.2
2026-Jun-17 10:49:23.773724 #16 8.805 + eslint-config-next@16.1.3
2026-Jun-17 10:49:23.773724 #16 8.805 + tailwindcss@4.1.18
2026-Jun-17 10:49:23.773724 #16 8.805 + tw-animate-css@1.4.0
2026-Jun-17 10:49:23.773724 #16 8.805 + typescript@5.9.3
2026-Jun-17 10:49:23.773724 #16 8.805 + @dnd-kit/core@6.3.1
2026-Jun-17 10:49:23.773724 #16 8.805 + @dnd-kit/sortable@10.0.0
2026-Jun-17 10:49:23.773724 #16 8.805 + @dnd-kit/utilities@3.2.2
2026-Jun-17 10:49:23.773724 #16 8.805 + @hookform/resolvers@5.2.2
2026-Jun-17 10:49:23.773724 #16 8.805 + @mdxeditor/editor@3.52.3
2026-Jun-17 10:49:23.773724 #16 8.805 + @prisma/client@6.19.2
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-accordion@1.2.12
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-alert-dialog@1.1.15
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-aspect-ratio@1.1.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-avatar@1.1.11
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-checkbox@1.3.3
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-collapsible@1.1.12
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-context-menu@2.2.16
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-dialog@1.1.15
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-dropdown-menu@2.1.16
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-hover-card@1.1.15
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-label@2.1.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-menubar@1.1.16
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-navigation-menu@1.2.14
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-popover@1.1.15
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-progress@1.1.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-radio-group@1.3.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-scroll-area@1.2.10
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-select@2.2.6
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-separator@1.1.8
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-slider@1.3.6
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-slot@1.2.4
2026-Jun-17 10:49:23.773724 #16 8.805 + @radix-ui/react-switch@1.2.6
2026-Jun-17 10:49:23.777682 #16 8.805 + @radix-ui/react-tabs@1.1.13
2026-Jun-17 10:49:23.777682 #16 8.805 + @radix-ui/react-toast@1.2.15
2026-Jun-17 10:49:23.777682 #16 8.805 + @radix-ui/react-toggle@1.1.10
2026-Jun-17 10:49:23.777682 #16 8.805 + @radix-ui/react-toggle-group@1.1.11
2026-Jun-17 10:49:23.777682 #16 8.805 + @radix-ui/react-tooltip@1.2.8
2026-Jun-17 10:49:23.777682 #16 8.805 + @reactuses/core@6.1.9
2026-Jun-17 10:49:23.777682 #16 8.805 + @tanstack/react-query@5.90.19
2026-Jun-17 10:49:23.777682 #16 8.805 + @tanstack/react-table@8.21.3
2026-Jun-17 10:49:23.777682 #16 8.805 + bcryptjs@3.0.3
2026-Jun-17 10:49:23.777682 #16 8.805 + class-variance-authority@0.7.1
2026-Jun-17 10:49:23.777682 #16 8.805 + clsx@2.1.1
2026-Jun-17 10:49:23.777682 #16 8.805 + cmdk@1.1.1
2026-Jun-17 10:49:23.777682 #16 8.805 + date-fns@4.1.0
2026-Jun-17 10:49:23.777682 #16 8.805 + embla-carousel-react@8.6.0
2026-Jun-17 10:49:23.777682 #16 8.805 + framer-motion@12.26.2
2026-Jun-17 10:49:23.777682 #16 8.805 + input-otp@1.4.2
2026-Jun-17 10:49:23.777682 #16 8.805 + lucide-react@0.525.0
2026-Jun-17 10:49:23.777682 #16 8.805 + next@16.1.3
2026-Jun-17 10:49:23.777682 #16 8.805 + next-auth@4.24.13
2026-Jun-17 10:49:23.777682 #16 8.805 + next-intl@4.7.0
2026-Jun-17 10:49:23.777682 #16 8.805 + next-themes@0.4.6
2026-Jun-17 10:49:23.777682 #16 8.805 + prisma@6.19.2
2026-Jun-17 10:49:23.777682 #16 8.805 + react@19.2.3
2026-Jun-17 10:49:23.777682 #16 8.805 + react-day-picker@9.13.0
2026-Jun-17 10:49:23.777682 #16 8.805 + react-dom@19.2.3
2026-Jun-17 10:49:23.777682 #16 8.805 + react-hook-form@7.71.1
2026-Jun-17 10:49:23.777682 #16 8.805 + react-markdown@10.1.0
2026-Jun-17 10:49:23.777682 #16 8.805 + react-resizable-panels@3.0.6
2026-Jun-17 10:49:23.777682 #16 8.805 + react-syntax-highlighter@15.6.6
2026-Jun-17 10:49:23.777682 #16 8.805 + recharts@2.15.4
2026-Jun-17 10:49:23.777682 #16 8.805 + sharp@0.34.5
2026-Jun-17 10:49:23.777682 #16 8.805 + socket.io@4.8.3
2026-Jun-17 10:49:23.777682 #16 8.805 + socket.io-client@4.8.3
2026-Jun-17 10:49:23.777682 #16 8.805 + sonner@2.0.7
2026-Jun-17 10:49:23.777682 #16 8.805 + tailwind-merge@3.4.0
2026-Jun-17 10:49:23.777682 #16 8.805 + tailwindcss-animate@1.0.7
2026-Jun-17 10:49:23.777682 #16 8.805 + uuid@11.1.0
2026-Jun-17 10:49:23.777682 #16 8.805 + vaul@1.1.2
2026-Jun-17 10:49:23.777682 #16 8.805 + z-ai-web-dev-sdk@0.0.17
2026-Jun-17 10:49:23.777682 #16 8.805 + zod@4.3.5
2026-Jun-17 10:49:23.777682 #16 8.805 + zustand@5.0.10
2026-Jun-17 10:49:23.777682 #16 8.805
2026-Jun-17 10:49:23.777682 #16 8.805 847 packages installed [8.51s]
2026-Jun-17 10:49:24.191437 #16 DONE 9.2s
2026-Jun-17 10:49:33.804951 #18 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 10:49:33.804951 #18 CACHED
2026-Jun-17 10:49:33.931010 #18 [app builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 10:49:33.931010 #18 CACHED
2026-Jun-17 10:49:33.931010
2026-Jun-17 10:49:33.931010 #19 [app builder 4/6] COPY . .
2026-Jun-17 10:49:34.352227 #19 DONE 0.3s
2026-Jun-17 10:49:34.352227
2026-Jun-17 10:49:34.352227 #20 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 10:49:36.018449 #20 1.819 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 10:49:37.097034 #20 2.898
2026-Jun-17 10:49:37.097034 #20 2.898 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 353ms
2026-Jun-17 10:49:37.097034 #20 2.898
2026-Jun-17 10:49:37.097034 #20 2.898 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 10:49:37.097034 #20 2.898
2026-Jun-17 10:49:37.097034 #20 2.898 Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
2026-Jun-17 10:49:37.097034 #20 2.898
2026-Jun-17 10:49:37.305115 #20 DONE 3.0s
2026-Jun-17 10:49:37.305115
2026-Jun-17 10:49:37.305115 #21 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 10:49:38.939304 #21 1.785 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 10:49:39.174411 #21 1.785
2026-Jun-17 10:49:39.174411 #21 1.870 Creating an optimized production build ...
2026-Jun-17 10:49:56.676024 #21 19.51 ✓ Compiled successfully in 16.8s
2026-Jun-17 10:49:56.827957 #21 19.51 Running TypeScript ...
2026-Jun-17 10:50:22.060858 #21 44.76 Collecting page data using 5 workers ...
2026-Jun-17 10:50:23.343269 #21 46.19 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 10:50:23.498229 #21 46.26 Generating static pages using 5 workers (28/113)
2026-Jun-17 10:50:23.498229 #21 46.34 Generating static pages using 5 workers (56/113)
2026-Jun-17 10:50:23.894401 #21 46.74 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 10:50:23.894401 #21 46.74 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 10:50:23.894401 #21 46.74
2026-Jun-17 10:50:23.894401 #21 46.74
2026-Jun-17 10:50:23.894401 #21 46.74 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 10:50:23.894401 #21 46.74
2026-Jun-17 10:50:23.894401 #21 46.74 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 10:50:23.894401 #21 46.74 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 10:50:23.894401 #21 46.74 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 10:50:23.894401 #21 46.74 clientVersion: '6.19.2',
2026-Jun-17 10:50:23.894401 #21 46.74 errorCode: undefined,
2026-Jun-17 10:50:23.894401 #21 46.74 retryable: undefined
2026-Jun-17 10:50:23.894401 #21 46.74 }
2026-Jun-17 10:50:24.113685 #21 46.81 Generating static pages using 5 workers (84/113)
2026-Jun-17 10:50:24.322544 #21 47.00 ✓ Generating static pages using 5 workers (113/113) in 814.9ms
2026-Jun-17 10:50:24.322544 #21 47.01 Finalizing page optimization ...
2026-Jun-17 10:50:24.938142 #21 47.78
2026-Jun-17 10:50:25.094062 #21 47.79 Route (app)
2026-Jun-17 10:50:25.094062 #21 47.79 ┌ ƒ /
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ○ /_not-found
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/cruceros
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/destinos
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/documentacion
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/excursiones
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/habitaciones
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/hoteles
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/login
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/marketing-modal
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/paquetes
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/resellers
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/reservas
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/revendedores
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/subagentes
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/transportes
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /admin/transportes/servicios
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/allotments
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/auth
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/auth/logout
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/bookings
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/cruises
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/destinations
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/excursions
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/help-articles
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/hotels
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/packages
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/rooms
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/stats
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/subagents
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/transport-providers
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/transport-services
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/upload
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/marketing-modal
2026-Jun-17 10:50:25.094062 #21 47.79 ├ ƒ /api/public/booking
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/cruises
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/destinations
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/excursions
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/help-articles
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/hotels
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/packages
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/stats
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/public/transport
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/auth
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/catalog
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/clients
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/commissions
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/dashboard
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/packages
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/transport
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/profile
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/register
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/sales
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/subagent/auth
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/subagent/bookings
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /api/upload
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /brand
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /contacto
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /cruceros
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /cruceros/[slug]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /destinos
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /destinos/[destinationId]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /excursiones
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /excursiones/[slug]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /hoteles
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /paquetes/[packageId]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /paquetes/armar
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog/packages
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/catalog/transport
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/clientes
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/comisiones
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/documentacion
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/login
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/productos
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/profile
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /reseller/register
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/settings
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/ventas
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/whitelabel
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /robots.txt
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /sitemap.xml
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /sobre-nosotros
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /subagent
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /subagent/clientes
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /subagent/comisiones
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /subagent/login
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /subagent/ventas
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ○ /transportes
2026-Jun-17 10:50:25.098338 #21 47.79 ├ ƒ /transportes/[serviceId]
2026-Jun-17 10:50:25.098338 #21 47.79 └ ƒ /uploads/[...path]
2026-Jun-17 10:50:25.098338 #21 47.79
2026-Jun-17 10:50:25.098338 #21 47.79
2026-Jun-17 10:50:25.098338 #21 47.79 ƒ Proxy (Middleware)
2026-Jun-17 10:50:25.098338 #21 47.79
2026-Jun-17 10:50:25.098338 #21 47.79 ○ (Static) prerendered as static content
2026-Jun-17 10:50:25.098338 #21 47.79 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 10:50:25.098338 #21 47.79
2026-Jun-17 10:50:25.351348 #21 DONE 48.0s
2026-Jun-17 10:50:25.633216 #22 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 10:50:26.772307 #22 DONE 1.0s
2026-Jun-17 10:50:40.776177 #23 [app runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 10:50:40.908059 #23 DONE 0.1s
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #24 [migrate builder 4/6] COPY . .
2026-Jun-17 10:50:40.908059 #24 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #25 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 10:50:40.908059 #25 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #26 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 10:50:40.908059 #26 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #27 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 10:50:40.908059 #27 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #28 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 10:50:40.908059 #28 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #29 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 10:50:40.908059 #29 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #30 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 10:50:40.908059 #30 CACHED
2026-Jun-17 10:50:40.908059
2026-Jun-17 10:50:40.908059 #31 [app runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 10:50:41.063161 #31 DONE 0.1s
2026-Jun-17 10:50:41.063161
2026-Jun-17 10:50:41.063161 #32 [migrate runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 10:50:53.622838 #32 DONE 12.6s
2026-Jun-17 10:50:53.622838
2026-Jun-17 10:50:53.622838 #33 [app runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 10:50:53.622838 #33 DONE 0.0s
2026-Jun-17 10:50:53.622838
2026-Jun-17 10:50:53.622838 #34 [app runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 10:50:53.622838 #34 DONE 0.0s
2026-Jun-17 10:50:53.622838
2026-Jun-17 10:50:53.622838 #35 [migrate runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 10:50:53.622838 #35 DONE 0.0s
2026-Jun-17 10:50:53.622838
2026-Jun-17 10:50:53.622838 #36 [app runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 10:50:53.794389 #36 DONE 0.0s
2026-Jun-17 10:50:53.794389
2026-Jun-17 10:50:53.794389 #37 [app runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 10:50:53.794389 #37 DONE 0.0s
2026-Jun-17 10:50:53.794389
2026-Jun-17 10:50:53.794389 #38 [app runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 10:50:54.133584 #38 DONE 0.3s
2026-Jun-17 10:50:54.133584
2026-Jun-17 10:50:54.133584 #39 [migrate] exporting to image
2026-Jun-17 10:50:54.133584 #39 exporting layers
2026-Jun-17 10:51:04.034205 #39 ...
2026-Jun-17 10:51:04.034205
2026-Jun-17 10:51:04.034205 #40 [app] exporting to image
2026-Jun-17 10:51:10.711465 #40 exporting layers 16.7s done
2026-Jun-17 10:51:10.869289 #40 writing image sha256:23cf8a3257b32fcaaec08f792e6b15ad9b49b08db34796a325543aa13d9e4b58 done
2026-Jun-17 10:51:10.869289 #40 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:0786813d2341981e7d715989c4f1331959e7f716 done
2026-Jun-17 10:51:10.869289 #40 ...
2026-Jun-17 10:51:10.869289
2026-Jun-17 10:51:10.869289 #39 [migrate] exporting to image
2026-Jun-17 10:51:10.869289 #39 exporting layers 16.7s done
2026-Jun-17 10:51:10.869289 #39 writing image sha256:23cf8a3257b32fcaaec08f792e6b15ad9b49b08db34796a325543aa13d9e4b58 done
2026-Jun-17 10:51:10.869289 #39 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:0786813d2341981e7d715989c4f1331959e7f716 done
2026-Jun-17 10:51:11.377485 #39 DONE 17.4s
2026-Jun-17 10:51:11.377485
2026-Jun-17 10:51:11.377485 #40 [app] exporting to image
2026-Jun-17 10:51:11.462610 #40 DONE 17.4s
2026-Jun-17 10:51:11.462610
2026-Jun-17 10:51:11.462610 #41 [app] resolving provenance for metadata file
2026-Jun-17 10:51:11.462610 #41 DONE 0.0s
2026-Jun-17 10:51:11.462610
2026-Jun-17 10:51:11.462610 #42 [migrate] resolving provenance for metadata file
2026-Jun-17 10:51:11.462610 #42 DONE 0.0s
2026-Jun-17 10:51:11.469321 app Built
2026-Jun-17 10:51:11.469321 migrate Built
2026-Jun-17 10:51:11.574889 Creating .env file with runtime variables for container.
2026-Jun-17 10:51:11.873488 Removing old containers.
2026-Jun-17 10:51:12.200863 [CMD]: docker stop --time=30 app-u3lniscxtfk1klnak223ta5d-104104302713
2026-Jun-17 10:51:12.200863 app-u3lniscxtfk1klnak223ta5d-104104302713
2026-Jun-17 10:51:12.349416 [CMD]: docker rm -f app-u3lniscxtfk1klnak223ta5d-104104302713
2026-Jun-17 10:51:12.349416 app-u3lniscxtfk1klnak223ta5d-104104302713
2026-Jun-17 10:51:12.481747 [CMD]: docker stop --time=30 migrate-u3lniscxtfk1klnak223ta5d-104104292581
2026-Jun-17 10:51:12.481747 migrate-u3lniscxtfk1klnak223ta5d-104104292581
2026-Jun-17 10:51:12.636129 [CMD]: docker rm -f migrate-u3lniscxtfk1klnak223ta5d-104104292581
2026-Jun-17 10:51:12.636129 migrate-u3lniscxtfk1klnak223ta5d-104104292581
2026-Jun-17 10:51:12.642723 Starting new application.
2026-Jun-17 10:51:12.924162 [CMD]: docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/z5b5g5wuc5d16dbrkfwlxaw2 -f /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/docker-compose.yaml up -d'
2026-Jun-17 10:51:13.378737 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Creating
2026-Jun-17 10:51:13.473039 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Created
2026-Jun-17 10:51:13.473039 Container app-u3lniscxtfk1klnak223ta5d-104911910987 Creating
2026-Jun-17 10:51:13.496965 Container app-u3lniscxtfk1klnak223ta5d-104911910987 Created
2026-Jun-17 10:51:13.502568 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Starting
2026-Jun-17 10:51:14.157341 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Started
2026-Jun-17 10:51:14.157341 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Waiting
2026-Jun-17 10:51:32.660136 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 10:51:32.660136 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 10:51:32.665583 exit status 1
2026-Jun-17 10:51:32.721358 ========================================
2026-Jun-17 10:51:32.731193 Deployment failed: Command execution failed (exit code 1): docker exec z5b5g5wuc5d16dbrkfwlxaw2 bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/z5b5g5wuc5d16dbrkfwlxaw2 -f /artifacts/z5b5g5wuc5d16dbrkfwlxaw2/docker-compose.yaml up -d'
2026-Jun-17 10:51:32.731193 Error: Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Creating
2026-Jun-17 10:51:32.731193 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Created
2026-Jun-17 10:51:32.731193 Container app-u3lniscxtfk1klnak223ta5d-104911910987 Creating
2026-Jun-17 10:51:32.731193 Container app-u3lniscxtfk1klnak223ta5d-104911910987 Created
2026-Jun-17 10:51:32.731193 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Starting
2026-Jun-17 10:51:32.731193 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Started
2026-Jun-17 10:51:32.731193 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 Waiting
2026-Jun-17 10:51:32.731193 Container migrate-u3lniscxtfk1klnak223ta5d-104911901627 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 10:51:32.731193 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 10:51:32.731193 exit status 1
2026-Jun-17 10:51:32.741804 Error type: App\Exceptions\DeploymentException
2026-Jun-17 10:51:32.751684 Error code: 0
2026-Jun-17 10:51:32.763108 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 10:51:32.775680 Stack trace (first 5 lines):
2026-Jun-17 10:51:32.786664 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 10:51:32.798162 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 10:51:32.810368 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 10:51:32.821854 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 10:51:32.833063 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 10:51:32.843823 ========================================
2026-Jun-17 10:51:33.189910 Gracefully shutting down build container: z5b5g5wuc5d16dbrkfwlxaw2
2026-Jun-17 10:51:33.427882 [CMD]: docker stop --time=30 z5b5g5wuc5d16dbrkfwlxaw2
2026-Jun-17 10:51:33.427882 z5b5g5wuc5d16dbrkfwlxaw2
