2026-Jun-17 11:42:27.300077 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 11:42:27.307848 Starting deployment of wilrop-app to localhost.
2026-Jun-17 11:42:27.613214 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 11:42:27.734677 [CMD]: docker stop --time=30 lxtyhp834e3lbzgmmzaa0zcl
2026-Jun-17 11:42:27.734677 Error response from daemon: No such container: lxtyhp834e3lbzgmmzaa0zcl
2026-Jun-17 11:42:27.875944 [CMD]: docker run -d --network 'coolify' --name lxtyhp834e3lbzgmmzaa0zcl --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 11:42:27.875944 cf37895b203a4a9e065a4f4de8dbe29e9ce53d8712a1b00d734e75199a904fc1
2026-Jun-17 11:42:30.458326 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 11:42:30.458326 cf8df499db1fa610216d8033d89127d02a6aab80 refs/heads/main
2026-Jun-17 11:42:30.596034 ----------------------------------------
2026-Jun-17 11:42:30.602636 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha cf8df499db1fa610216d8033d89127d02a6aab80) to /artifacts/lxtyhp834e3lbzgmmzaa0zcl.
2026-Jun-17 11:42:30.905938 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'mkdir -p /root/.ssh' && docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl > /dev/null' && docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl' && docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/lxtyhp834e3lbzgmmzaa0zcl'\'' && cd '\''/artifacts/lxtyhp834e3lbzgmmzaa0zcl'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''cf8df499db1fa610216d8033d89127d02a6aab80'\'' && git -c advice.detachedHead=false checkout '\''cf8df499db1fa610216d8033d89127d02a6aab80'\'' >/dev/null 2>&1 && cd '\''/artifacts/lxtyhp834e3lbzgmmzaa0zcl'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/lxtyhp834e3lbzgmmzaa0zcl'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_lxtyhp834e3lbzgmmzaa0zcl -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 11:42:30.905938 Cloning into '/artifacts/lxtyhp834e3lbzgmmzaa0zcl'...
2026-Jun-17 11:42:35.617006 From github.com:cambiodigital/wilrop
2026-Jun-17 11:42:35.617006 * branch cf8df499db1fa610216d8033d89127d02a6aab80 -> FETCH_HEAD
2026-Jun-17 11:42:37.459824 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'cd /artifacts/lxtyhp834e3lbzgmmzaa0zcl && git log -1 '\''cf8df499db1fa610216d8033d89127d02a6aab80'\'' --pretty=%B'
2026-Jun-17 11:42:37.459824 build: add coolify network to docker compose files
2026-Jun-17 11:42:37.459824
2026-Jun-17 11:42:37.459824 update both docker-compose.yaml and docker-compose.yml to add the coolify external network definition and attach services to it
2026-Jun-17 11:42:42.828116 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'test -f /artifacts/lxtyhp834e3lbzgmmzaa0zcl/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 11:42:42.828116 exists
2026-Jun-17 11:42:42.969029 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'cat /artifacts/lxtyhp834e3lbzgmmzaa0zcl/Dockerfile'
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 FROM oven/bun:1-alpine AS deps
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 WORKDIR /app
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 COPY package.json bun.lock ./
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 11:42:42.969029 RUN bun install --frozen-lockfile
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 FROM node:22-alpine AS builder
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 WORKDIR /app
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:42:42.969029 COPY . .
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 11:42:42.969029 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # Compila Next.js en modo standalone;
2026-Jun-17 11:42:42.969029 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 11:42:42.969029 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 11:42:42.969029 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 11:42:42.969029 && cp -r public .next/standalone/
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 11:42:42.969029 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 FROM node:22-alpine AS runner
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 WORKDIR /app
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 ENV NODE_ENV=production
2026-Jun-17 11:42:42.969029 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:42:42.969029 ENV PORT=3000
2026-Jun-17 11:42:42.969029 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 RUN apk add --no-cache curl
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 11:42:42.969029 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 11:42:42.969029 && adduser --system --uid 1001 nextjs
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:42:42.969029 # Assets estáticos
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:42:42.969029 # Archivos públicos
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 11:42:42.969029 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:42:42.969029 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:42:42.969029 # Scripts operativos usados por el entrypoint
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:42:42.969029 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:42.969029 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:42:42.969029 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 USER nextjs
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 EXPOSE 3000
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 LABEL traefik.enable=true
2026-Jun-17 11:42:42.969029 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 11:42:42.969029 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 11:42:42.969029
2026-Jun-17 11:42:42.969029 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 11:42:42.969029 CMD ["web"]
2026-Jun-17 11:42:43.128114 Added 36 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 11:42:43.274013 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'test -f /artifacts/lxtyhp834e3lbzgmmzaa0zcl/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 11:42:43.274013 exists
2026-Jun-17 11:42:43.420317 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'cat /artifacts/lxtyhp834e3lbzgmmzaa0zcl/Dockerfile'
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 FROM oven/bun:1-alpine AS deps
2026-Jun-17 11:42:43.420317 ARG COOLIFY_FQDN
2026-Jun-17 11:42:43.420317 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_SECRET
2026-Jun-17 11:42:43.420317 ARG DATABASE_URL
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_URL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:42:43.420317 ARG PORT
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 WORKDIR /app
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 COPY package.json bun.lock ./
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 11:42:43.420317 RUN bun install --frozen-lockfile
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 FROM node:22-alpine AS builder
2026-Jun-17 11:42:43.420317 ARG COOLIFY_FQDN
2026-Jun-17 11:42:43.420317 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_SECRET
2026-Jun-17 11:42:43.420317 ARG DATABASE_URL
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_URL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:42:43.420317 ARG PORT
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 WORKDIR /app
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:42:43.420317 COPY . .
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 11:42:43.420317 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # Compila Next.js en modo standalone;
2026-Jun-17 11:42:43.420317 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 11:42:43.420317 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 11:42:43.420317 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 11:42:43.420317 && cp -r public .next/standalone/
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 11:42:43.420317 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 FROM node:22-alpine AS runner
2026-Jun-17 11:42:43.420317 ARG COOLIFY_FQDN
2026-Jun-17 11:42:43.420317 ARG WILROP_SESSION_SECRET
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_SECRET
2026-Jun-17 11:42:43.420317 ARG DATABASE_URL
2026-Jun-17 11:42:43.420317 ARG NEXTAUTH_URL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 11:42:43.420317 ARG PORT
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 11:42:43.420317 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 11:42:43.420317 ARG WILROP_ADMIN_NAME
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 WORKDIR /app
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 ENV NODE_ENV=production
2026-Jun-17 11:42:43.420317 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 11:42:43.420317 ENV PORT=3000
2026-Jun-17 11:42:43.420317 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 RUN apk add --no-cache curl
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 11:42:43.420317 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 11:42:43.420317 && adduser --system --uid 1001 nextjs
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:42:43.420317 # Assets estáticos
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:42:43.420317 # Archivos públicos
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 11:42:43.420317 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:42:43.420317 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:42:43.420317 # Scripts operativos usados por el entrypoint
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:42:43.420317 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 11:42:43.420317 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:42:43.420317 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 USER nextjs
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 EXPOSE 3000
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 LABEL traefik.enable=true
2026-Jun-17 11:42:43.420317 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 11:42:43.420317 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 11:42:43.420317
2026-Jun-17 11:42:43.420317 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 11:42:43.420317 CMD ["web"]
2026-Jun-17 11:42:43.429286 Service app: All required ARG declarations already exist.
2026-Jun-17 11:42:43.437731 Pulling & building required images.
2026-Jun-17 11:42:43.497925 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 11:42:43.655626 Adding build arguments to Docker Compose build command.
2026-Jun-17 11:42:44.041485 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/lxtyhp834e3lbzgmmzaa0zcl -f /artifacts/lxtyhp834e3lbzgmmzaa0zcl/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg WILROP_ADMIN_EMAIL --build-arg WILROP_ADMIN_NAME --build-arg COOLIFY_BUILD_SECRETS_HASH=65ad93702e6059d8eb7a8d6579a3a74fbf6d0d6ff60a223b2a9253c29613a104'
2026-Jun-17 11:42:44.041485 #1 [internal] load local bake definitions
2026-Jun-17 11:42:44.283206 #1 reading from stdin 2.50kB done
2026-Jun-17 11:42:44.283206 #1 DONE 0.0s
2026-Jun-17 11:42:44.283206
2026-Jun-17 11:42:44.283206 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 11:42:44.283206 #2 transferring dockerfile: 5.44kB done
2026-Jun-17 11:42:44.283206 #2 DONE 0.0s
2026-Jun-17 11:42:44.283206
2026-Jun-17 11:42:44.283206 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 11:42:44.283206 #3 transferring dockerfile: 5.44kB done
2026-Jun-17 11:42:44.283206 #3 DONE 0.0s
2026-Jun-17 11:42:44.283206
2026-Jun-17 11:42:44.283206 #4 [app internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 11:42:45.217607 #4 DONE 0.9s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #5 [migrate internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 11:42:45.217607 #5 DONE 0.9s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #6 [migrate internal] load .dockerignore
2026-Jun-17 11:42:45.217607 #6 transferring context: 1.12kB done
2026-Jun-17 11:42:45.217607 #6 DONE 0.0s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #7 [app internal] load .dockerignore
2026-Jun-17 11:42:45.217607 #7 transferring context: 1.12kB done
2026-Jun-17 11:42:45.217607 #7 DONE 0.0s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #8 [app deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 11:42:45.217607 #8 DONE 0.0s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #9 [app builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 11:42:45.217607 #9 DONE 0.0s
2026-Jun-17 11:42:45.217607
2026-Jun-17 11:42:45.217607 #10 [migrate internal] load build context
2026-Jun-17 11:42:45.317139 #10 transferring context: 12.06MB 0.2s done
2026-Jun-17 11:42:45.317139 #10 DONE 0.2s
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #11 [app internal] load build context
2026-Jun-17 11:42:45.317139 #11 transferring context: 12.06MB 0.2s done
2026-Jun-17 11:42:45.317139 #11 DONE 0.2s
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #12 [app deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 11:42:45.317139 #12 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #13 [app builder 2/6] WORKDIR /app
2026-Jun-17 11:42:45.317139 #13 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #14 [app deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 11:42:45.317139 #14 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #15 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:42:45.317139 #15 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #16 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 11:42:45.317139 #16 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #17 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 11:42:45.317139 #17 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #18 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 11:42:45.317139 #18 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #19 [migrate deps 2/4] WORKDIR /app
2026-Jun-17 11:42:45.317139 #19 CACHED
2026-Jun-17 11:42:45.317139
2026-Jun-17 11:42:45.317139 #20 [app builder 4/6] COPY . .
2026-Jun-17 11:42:45.647699 #20 DONE 0.2s
2026-Jun-17 11:42:45.647699
2026-Jun-17 11:42:45.647699 #21 [app builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 11:42:46.880260 #21 1.384 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 11:42:48.225258 #21 2.521
2026-Jun-17 11:42:48.225258 #21 2.521 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 345ms
2026-Jun-17 11:42:48.225258 #21 2.521
2026-Jun-17 11:42:48.225258 #21 2.521 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 11:42:48.225258 #21 2.521
2026-Jun-17 11:42:48.225258 #21 2.521 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
2026-Jun-17 11:42:48.225258 #21 2.521
2026-Jun-17 11:42:48.225258 #21 DONE 2.6s
2026-Jun-17 11:42:48.225258
2026-Jun-17 11:42:48.225258 #22 [app builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 11:42:49.678707 #22 1.604 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 11:42:49.908192 #22 1.605
2026-Jun-17 11:42:49.908192 #22 1.683 Creating an optimized production build ...
2026-Jun-17 11:43:08.176450 #22 20.06 ✓ Compiled successfully in 17.6s
2026-Jun-17 11:43:08.313980 #22 20.07 Running TypeScript ...
2026-Jun-17 11:43:33.155022 #22 44.92 Collecting page data using 5 workers ...
2026-Jun-17 11:43:34.706316 #22 46.47 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 11:43:34.706316 #22 46.55 Generating static pages using 5 workers (28/113)
2026-Jun-17 11:43:34.706316 #22 46.63 Generating static pages using 5 workers (56/113)
2026-Jun-17 11:43:35.183481 #22 47.11 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 11:43:35.183481 #22 47.11 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 11:43:35.187914 #22 47.11
2026-Jun-17 11:43:35.187914 #22 47.11
2026-Jun-17 11:43:35.187914 #22 47.11 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 11:43:35.187914 #22 47.11
2026-Jun-17 11:43:35.187914 #22 47.11 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 11:43:35.187914 #22 47.11 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 11:43:35.187914 #22 47.11 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 11:43:35.187914 #22 47.11 clientVersion: '6.19.2',
2026-Jun-17 11:43:35.187914 #22 47.11 errorCode: undefined,
2026-Jun-17 11:43:35.187914 #22 47.11 retryable: undefined
2026-Jun-17 11:43:35.187914 #22 47.11 }
2026-Jun-17 11:43:35.373465 #22 47.15 Generating static pages using 5 workers (84/113)
2026-Jun-17 11:43:35.562312 #22 47.33 ✓ Generating static pages using 5 workers (113/113) in 862.2ms
2026-Jun-17 11:43:35.562312 #22 47.34 Finalizing page optimization ...
2026-Jun-17 11:43:36.111287 #22 48.04
2026-Jun-17 11:43:36.267730 #22 48.04 Route (app)
2026-Jun-17 11:43:36.267730 #22 48.04 ┌ ƒ /
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /_not-found
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/cruceros
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/destinos
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/documentacion
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/excursiones
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/habitaciones
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/hoteles
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/login
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/marketing-modal
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/paquetes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/resellers
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/reservas
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/revendedores
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/subagentes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/transportes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /admin/transportes/servicios
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/allotments
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/auth
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/auth/logout
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/bookings
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/cruises
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/destinations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/excursions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/help-articles
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/hotels
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/packages
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/rooms
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/stats
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/subagents
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/transport-providers
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/transport-services
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/upload
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/marketing-modal
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/booking
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/cruises
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/destinations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/excursions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/help-articles
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/hotels
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/packages
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/stats
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/public/transport
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/auth
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/catalog
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/clients
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/commissions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/dashboard
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/packages
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/transport
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/profile
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/register
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/sales
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/subagent/auth
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/subagent/bookings
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /api/upload
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /brand
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /contacto
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /cruceros
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /cruceros/[slug]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /destinos
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /destinos/[destinationId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /excursiones
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /excursiones/[slug]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /hoteles
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /paquetes/[packageId]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /paquetes/armar
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog/packages
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/catalog/transport
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/clientes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/comisiones
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/documentacion
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/login
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/productos
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/profile
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /reseller/register
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/settings
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/ventas
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/whitelabel
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /robots.txt
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /sitemap.xml
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /sobre-nosotros
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /subagent
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /subagent/clientes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /subagent/comisiones
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /subagent/login
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /subagent/ventas
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ○ /transportes
2026-Jun-17 11:43:36.267730 #22 48.04 ├ ƒ /transportes/[serviceId]
2026-Jun-17 11:43:36.267730 #22 48.04 └ ƒ /uploads/[...path]
2026-Jun-17 11:43:36.267730 #22 48.04
2026-Jun-17 11:43:36.267730 #22 48.04
2026-Jun-17 11:43:36.267730 #22 48.04 ƒ Proxy (Middleware)
2026-Jun-17 11:43:36.267730 #22 48.04
2026-Jun-17 11:43:36.267730 #22 48.04 ○ (Static) prerendered as static content
2026-Jun-17 11:43:36.267730 #22 48.04 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 11:43:36.267730 #22 48.04
2026-Jun-17 11:43:36.544295 #22 DONE 48.3s
2026-Jun-17 11:43:51.988009 #23 [migrate runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 11:43:51.988009 #23 CACHED
2026-Jun-17 11:43:51.988009
2026-Jun-17 11:43:51.988009 #24 [migrate runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 11:43:52.141100 #24 CACHED
2026-Jun-17 11:43:52.141100
2026-Jun-17 11:43:52.141100 #23 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 11:43:52.141100 #23 CACHED
2026-Jun-17 11:43:52.141100
2026-Jun-17 11:43:52.141100 #25 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 11:43:53.413920 #25 DONE 1.2s
2026-Jun-17 11:43:53.413920
2026-Jun-17 11:43:53.413920 #26 [migrate runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 11:43:53.413920 #26 DONE 0.0s
2026-Jun-17 11:43:53.413920
2026-Jun-17 11:43:53.413920 #27 [migrate runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 11:43:53.413920 #27 DONE 0.0s
2026-Jun-17 11:43:53.413920
2026-Jun-17 11:43:53.413920 #28 [migrate runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 11:44:05.131343 #28 DONE 11.8s
2026-Jun-17 11:44:05.131343
2026-Jun-17 11:44:05.131343 #29 [migrate runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 11:44:05.131343 #29 DONE 0.0s
2026-Jun-17 11:44:05.131343
2026-Jun-17 11:44:05.131343 #30 [migrate runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 11:44:05.131343 #30 DONE 0.0s
2026-Jun-17 11:44:05.131343
2026-Jun-17 11:44:05.131343 #31 [app runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 11:44:05.340019 #31 DONE 0.0s
2026-Jun-17 11:44:05.340019
2026-Jun-17 11:44:05.340019 #32 [app runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 11:44:05.340019 #32 DONE 0.0s
2026-Jun-17 11:44:05.340019
2026-Jun-17 11:44:05.340019 #33 [migrate runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 11:44:05.340019 #33 DONE 0.0s
2026-Jun-17 11:44:05.340019
2026-Jun-17 11:44:05.340019 #34 [app runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 11:44:05.690835 #34 DONE 0.3s
2026-Jun-17 11:44:05.690835
2026-Jun-17 11:44:05.690835 #35 [migrate] exporting to image
2026-Jun-17 11:44:05.690835 #35 exporting layers
2026-Jun-17 11:44:15.590904 #35 ...
2026-Jun-17 11:44:15.590904
2026-Jun-17 11:44:15.590904 #36 [app] exporting to image
2026-Jun-17 11:44:22.439656 #36 ...
2026-Jun-17 11:44:22.439656
2026-Jun-17 11:44:22.439656 #35 [migrate] exporting to image
2026-Jun-17 11:44:22.439656 #35 exporting layers 16.9s done
2026-Jun-17 11:44:22.596202 #35 writing image sha256:2a90da70a77e45afd7691854bdea9127a8cee8cc1ce23fe21565f29802469a2f done
2026-Jun-17 11:44:22.596202 #35 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:cf8df499db1fa610216d8033d89127d02a6aab80 done
2026-Jun-17 11:44:23.102669 #35 ...
2026-Jun-17 11:44:23.102669
2026-Jun-17 11:44:23.102669 #36 [app] exporting to image
2026-Jun-17 11:44:23.102669 #36 exporting layers 16.9s done
2026-Jun-17 11:44:23.102669 #36 writing image sha256:2a90da70a77e45afd7691854bdea9127a8cee8cc1ce23fe21565f29802469a2f done
2026-Jun-17 11:44:23.102669 #36 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:cf8df499db1fa610216d8033d89127d02a6aab80 done
2026-Jun-17 11:44:23.102669 #36 DONE 17.6s
2026-Jun-17 11:44:23.215290 #35 [migrate] exporting to image
2026-Jun-17 11:44:23.215290 #35 DONE 17.6s
2026-Jun-17 11:44:23.215290
2026-Jun-17 11:44:23.215290 #37 [migrate] resolving provenance for metadata file
2026-Jun-17 11:44:23.215290 #37 DONE 0.0s
2026-Jun-17 11:44:23.215290
2026-Jun-17 11:44:23.215290 #38 [app] resolving provenance for metadata file
2026-Jun-17 11:44:23.215290 #38 DONE 0.0s
2026-Jun-17 11:44:23.221391 migrate Built
2026-Jun-17 11:44:23.221391 app Built
2026-Jun-17 11:44:23.323515 Creating .env file with runtime variables for container.
2026-Jun-17 11:44:23.611489 Removing old containers.
2026-Jun-17 11:44:23.871695 [CMD]: docker stop --time=30 app-u3lniscxtfk1klnak223ta5d-111556417859
2026-Jun-17 11:44:23.871695 app-u3lniscxtfk1klnak223ta5d-111556417859
2026-Jun-17 11:44:24.010011 [CMD]: docker rm -f app-u3lniscxtfk1klnak223ta5d-111556417859
2026-Jun-17 11:44:24.010011 app-u3lniscxtfk1klnak223ta5d-111556417859
2026-Jun-17 11:44:24.137535 [CMD]: docker stop --time=30 migrate-u3lniscxtfk1klnak223ta5d-111556409412
2026-Jun-17 11:44:24.137535 migrate-u3lniscxtfk1klnak223ta5d-111556409412
2026-Jun-17 11:44:24.272680 [CMD]: docker rm -f migrate-u3lniscxtfk1klnak223ta5d-111556409412
2026-Jun-17 11:44:24.272680 migrate-u3lniscxtfk1klnak223ta5d-111556409412
2026-Jun-17 11:44:24.278385 Starting new application.
2026-Jun-17 11:44:24.544174 [CMD]: docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/lxtyhp834e3lbzgmmzaa0zcl/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/lxtyhp834e3lbzgmmzaa0zcl -f /artifacts/lxtyhp834e3lbzgmmzaa0zcl/docker-compose.yaml up -d'
2026-Jun-17 11:44:24.916794 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Creating
2026-Jun-17 11:44:24.998753 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Created
2026-Jun-17 11:44:25.003019 Container app-u3lniscxtfk1klnak223ta5d-114242509010 Creating
2026-Jun-17 11:44:25.020425 Container app-u3lniscxtfk1klnak223ta5d-114242509010 Created
2026-Jun-17 11:44:25.020425 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Starting
2026-Jun-17 11:44:25.500872 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Started
2026-Jun-17 11:44:25.500872 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Waiting
2026-Jun-17 11:44:44.002430 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:44:44.002430 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:44:44.006892 exit status 1
2026-Jun-17 11:44:44.058726 ========================================
2026-Jun-17 11:44:44.067293 Deployment failed: Command execution failed (exit code 1): docker exec lxtyhp834e3lbzgmmzaa0zcl bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/lxtyhp834e3lbzgmmzaa0zcl/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/lxtyhp834e3lbzgmmzaa0zcl -f /artifacts/lxtyhp834e3lbzgmmzaa0zcl/docker-compose.yaml up -d'
2026-Jun-17 11:44:44.067293 Error: Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Creating
2026-Jun-17 11:44:44.067293 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Created
2026-Jun-17 11:44:44.067293 Container app-u3lniscxtfk1klnak223ta5d-114242509010 Creating
2026-Jun-17 11:44:44.067293 Container app-u3lniscxtfk1klnak223ta5d-114242509010 Created
2026-Jun-17 11:44:44.067293 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Starting
2026-Jun-17 11:44:44.067293 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Started
2026-Jun-17 11:44:44.067293 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 Waiting
2026-Jun-17 11:44:44.067293 Container migrate-u3lniscxtfk1klnak223ta5d-114242501473 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:44:44.067293 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 11:44:44.067293 exit status 1
2026-Jun-17 11:44:44.075310 Error type: App\Exceptions\DeploymentException
2026-Jun-17 11:44:44.084298 Error code: 0
2026-Jun-17 11:44:44.093799 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 11:44:44.102309 Stack trace (first 5 lines):
2026-Jun-17 11:44:44.110517 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 11:44:44.118766 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 11:44:44.127603 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 11:44:44.135939 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 11:44:44.144763 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 11:44:44.152574 ========================================
2026-Jun-17 11:44:44.481094 Gracefully shutting down build container: lxtyhp834e3lbzgmmzaa0zcl
2026-Jun-17 11:44:44.712401 [CMD]: docker stop --time=30 lxtyhp834e3lbzgmmzaa0zcl
2026-Jun-17 11:44:44.712401 lxtyhp834e3lbzgmmzaa0zcl
