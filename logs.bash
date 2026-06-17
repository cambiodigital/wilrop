2026-Jun-17 08:48:15.008694 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 08:48:15.020175 Starting deployment of wilrop-app to localhost.
2026-Jun-17 08:48:15.355460 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:48:15.485815 [CMD]: docker stop --time=30 yo7kb8q0umqe61h9bwp2b8wr
2026-Jun-17 08:48:15.485815 Error response from daemon: No such container: yo7kb8q0umqe61h9bwp2b8wr
2026-Jun-17 08:48:15.641449 [CMD]: docker run -d --network 'coolify' --name yo7kb8q0umqe61h9bwp2b8wr --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:48:15.641449 0fa6a9ccf2c5bab5ccabcde4377845e5155f3984c3a5976eed2f791ebdaaa577
2026-Jun-17 08:48:18.338993 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 08:48:18.338993 f0001f20fa7540bb13f2ff2a1f93112799186a16 refs/heads/main
2026-Jun-17 08:48:18.479682 ----------------------------------------
2026-Jun-17 08:48:18.486766 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha f0001f20fa7540bb13f2ff2a1f93112799186a16) to /artifacts/yo7kb8q0umqe61h9bwp2b8wr.
2026-Jun-17 08:48:18.791507 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'mkdir -p /root/.ssh' && docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr > /dev/null' && docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr' && docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/yo7kb8q0umqe61h9bwp2b8wr'\'' && cd '\''/artifacts/yo7kb8q0umqe61h9bwp2b8wr'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''f0001f20fa7540bb13f2ff2a1f93112799186a16'\'' && git -c advice.detachedHead=false checkout '\''f0001f20fa7540bb13f2ff2a1f93112799186a16'\'' >/dev/null 2>&1 && cd '\''/artifacts/yo7kb8q0umqe61h9bwp2b8wr'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/yo7kb8q0umqe61h9bwp2b8wr'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_yo7kb8q0umqe61h9bwp2b8wr -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 08:48:18.791507 Cloning into '/artifacts/yo7kb8q0umqe61h9bwp2b8wr'...
2026-Jun-17 08:48:23.601270 From github.com:cambiodigital/wilrop
2026-Jun-17 08:48:23.601270 * branch f0001f20fa7540bb13f2ff2a1f93112799186a16 -> FETCH_HEAD
2026-Jun-17 08:48:25.413797 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'cd /artifacts/yo7kb8q0umqe61h9bwp2b8wr && git log -1 '\''f0001f20fa7540bb13f2ff2a1f93112799186a16'\'' --pretty=%B'
2026-Jun-17 08:48:25.413797 build(docker): replace ports with expose directive
2026-Jun-17 08:48:25.413797
2026-Jun-17 08:48:25.413797 make port 3000 available only to linked docker services rather than publishing it to the host network
2026-Jun-17 08:48:30.926938 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'test -f /artifacts/yo7kb8q0umqe61h9bwp2b8wr/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:48:30.926938 exists
2026-Jun-17 08:48:31.076466 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'cat /artifacts/yo7kb8q0umqe61h9bwp2b8wr/Dockerfile'
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 WORKDIR /app
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 COPY package.json bun.lock ./
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:48:31.076466 RUN bun install --frozen-lockfile
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 FROM node:22-alpine AS builder
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 WORKDIR /app
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:48:31.076466 COPY . .
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:48:31.076466 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # Compila Next.js en modo standalone;
2026-Jun-17 08:48:31.076466 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:48:31.076466 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:48:31.076466 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:48:31.076466 && cp -r public .next/standalone/
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:48:31.076466 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 FROM node:22-alpine AS runner
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 WORKDIR /app
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 ENV NODE_ENV=production
2026-Jun-17 08:48:31.076466 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:48:31.076466 ENV PORT=3000
2026-Jun-17 08:48:31.076466 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 RUN apk add --no-cache curl
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:48:31.076466 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:48:31.076466 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:48:31.076466 # Assets estáticos
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:48:31.076466 # Archivos públicos
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:48:31.076466 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:48:31.076466 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:48:31.076466 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:48:31.076466 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.076466 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:48:31.076466 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 USER nextjs
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 EXPOSE 3000
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 LABEL traefik.enable=true
2026-Jun-17 08:48:31.076466 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:48:31.076466 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:48:31.076466
2026-Jun-17 08:48:31.076466 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:48:31.076466 CMD ["web"]
2026-Jun-17 08:48:31.240453 Added 45 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 08:48:31.391356 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'test -f /artifacts/yo7kb8q0umqe61h9bwp2b8wr/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:48:31.391356 exists
2026-Jun-17 08:48:31.553814 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'cat /artifacts/yo7kb8q0umqe61h9bwp2b8wr/Dockerfile'
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:48:31.553814 ARG COOLIFY_FQDN
2026-Jun-17 08:48:31.553814 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_SECRET
2026-Jun-17 08:48:31.553814 ARG DATABASE_URL
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_URL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:48:31.553814 ARG PORT
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:48:31.553814 ARG POSTGRES_USER
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:48:31.553814 ARG POSTGRES_PASSWORD
2026-Jun-17 08:48:31.553814 ARG POSTGRES_DB
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 WORKDIR /app
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 COPY package.json bun.lock ./
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:48:31.553814 RUN bun install --frozen-lockfile
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 FROM node:22-alpine AS builder
2026-Jun-17 08:48:31.553814 ARG COOLIFY_FQDN
2026-Jun-17 08:48:31.553814 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_SECRET
2026-Jun-17 08:48:31.553814 ARG DATABASE_URL
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_URL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:48:31.553814 ARG PORT
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:48:31.553814 ARG POSTGRES_USER
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:48:31.553814 ARG POSTGRES_PASSWORD
2026-Jun-17 08:48:31.553814 ARG POSTGRES_DB
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 WORKDIR /app
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:48:31.553814 COPY . .
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:48:31.553814 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # Compila Next.js en modo standalone;
2026-Jun-17 08:48:31.553814 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:48:31.553814 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:48:31.553814 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:48:31.553814 && cp -r public .next/standalone/
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:48:31.553814 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 FROM node:22-alpine AS runner
2026-Jun-17 08:48:31.553814 ARG COOLIFY_FQDN
2026-Jun-17 08:48:31.553814 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_SECRET
2026-Jun-17 08:48:31.553814 ARG DATABASE_URL
2026-Jun-17 08:48:31.553814 ARG NEXTAUTH_URL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:48:31.553814 ARG PORT
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:48:31.553814 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:48:31.553814 ARG POSTGRES_USER
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_EMAIL
2026-Jun-17 08:48:31.553814 ARG WILROP_ADMIN_NAME
2026-Jun-17 08:48:31.553814 ARG POSTGRES_PASSWORD
2026-Jun-17 08:48:31.553814 ARG POSTGRES_DB
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 WORKDIR /app
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 ENV NODE_ENV=production
2026-Jun-17 08:48:31.553814 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:48:31.553814 ENV PORT=3000
2026-Jun-17 08:48:31.553814 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 RUN apk add --no-cache curl
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:48:31.553814 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:48:31.553814 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:48:31.553814 # Assets estáticos
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:48:31.553814 # Archivos públicos
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:48:31.553814 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:48:31.553814 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:48:31.553814 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:48:31.553814 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:48:31.553814 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:48:31.553814 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 USER nextjs
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 EXPOSE 3000
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 LABEL traefik.enable=true
2026-Jun-17 08:48:31.553814 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:48:31.553814 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:48:31.553814
2026-Jun-17 08:48:31.553814 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:48:31.553814 CMD ["web"]
2026-Jun-17 08:48:31.562673 Service app: All required ARG declarations already exist.
2026-Jun-17 08:48:31.571007 Pulling & building required images.
2026-Jun-17 08:48:31.654101 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 08:48:31.817346 Adding build arguments to Docker Compose build command.
2026-Jun-17 08:48:32.196626 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/yo7kb8q0umqe61h9bwp2b8wr -f /artifacts/yo7kb8q0umqe61h9bwp2b8wr/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg POSTGRES_USER --build-arg WILROP_ADMIN_EMAIL --build-arg WILROP_ADMIN_NAME --build-arg POSTGRES_PASSWORD --build-arg POSTGRES_DB --build-arg COOLIFY_BUILD_SECRETS_HASH=5c6ed2c37309fa9fbd3a134c5f4fda686e99c6dfca55ee4c1dde40748ca9a788'
2026-Jun-17 08:48:32.196626 #1 [internal] load local bake definitions
2026-Jun-17 08:48:32.300630 #1 reading from stdin 2.73kB done
2026-Jun-17 08:48:32.300630 #1 DONE 0.0s
2026-Jun-17 08:48:32.300630
2026-Jun-17 08:48:32.300630 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 08:48:32.300630 #2 transferring dockerfile: 5.61kB done
2026-Jun-17 08:48:32.300630 #2 DONE 0.0s
2026-Jun-17 08:48:32.300630
2026-Jun-17 08:48:32.300630 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 08:48:32.300630 #3 transferring dockerfile: 5.61kB done
2026-Jun-17 08:48:32.300630 #3 DONE 0.0s
2026-Jun-17 08:48:32.455849 #4 [migrate internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 08:48:33.248107 #4 DONE 0.8s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #5 [migrate internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 08:48:33.248107 #5 DONE 0.8s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #6 [migrate internal] load .dockerignore
2026-Jun-17 08:48:33.248107 #6 transferring context: 1.12kB done
2026-Jun-17 08:48:33.248107 #6 DONE 0.0s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #7 [app internal] load .dockerignore
2026-Jun-17 08:48:33.248107 #7 transferring context: 1.12kB done
2026-Jun-17 08:48:33.248107 #7 DONE 0.0s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #8 [app deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 08:48:33.248107 #8 DONE 0.0s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #9 [app builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 08:48:33.248107 #9 DONE 0.0s
2026-Jun-17 08:48:33.248107
2026-Jun-17 08:48:33.248107 #10 [migrate internal] load build context
2026-Jun-17 08:48:33.486174 #10 transferring context: 12.06MB 0.2s done
2026-Jun-17 08:48:33.486174 #10 DONE 0.2s
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #11 [app internal] load build context
2026-Jun-17 08:48:33.486174 #11 transferring context: 12.06MB 0.2s done
2026-Jun-17 08:48:33.486174 #11 DONE 0.2s
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #12 [app deps 2/4] WORKDIR /app
2026-Jun-17 08:48:33.486174 #12 CACHED
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #13 [app deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 08:48:33.486174 #13 CACHED
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #14 [app deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 08:48:33.486174 #14 CACHED
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #15 [migrate builder 2/6] WORKDIR /app
2026-Jun-17 08:48:33.486174 #15 CACHED
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #16 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:48:33.486174 #16 CACHED
2026-Jun-17 08:48:33.486174
2026-Jun-17 08:48:33.486174 #17 [migrate builder 4/6] COPY . .
2026-Jun-17 08:48:33.658289 #17 DONE 0.2s
2026-Jun-17 08:48:33.658289
2026-Jun-17 08:48:33.658289 #18 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:48:35.006824 #18 1.502 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 08:48:36.412772 #18 2.702
2026-Jun-17 08:48:36.412772 #18 2.702 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 405ms
2026-Jun-17 08:48:36.412772 #18 2.702
2026-Jun-17 08:48:36.412772 #18 2.702 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 08:48:36.412772 #18 2.702
2026-Jun-17 08:48:36.412772 #18 2.702 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
2026-Jun-17 08:48:36.412772 #18 2.702
2026-Jun-17 08:48:36.412772 #18 DONE 2.8s
2026-Jun-17 08:48:36.412772
2026-Jun-17 08:48:36.412772 #19 [app builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 08:48:37.894085 #19 1.632 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 08:48:38.135630 #19 1.632
2026-Jun-17 08:48:38.135630 #19 1.723 Creating an optimized production build ...
2026-Jun-17 08:48:55.542165 #19 19.25 ✓ Compiled successfully in 16.7s
2026-Jun-17 08:48:55.542165 #19 19.25 Running TypeScript ...
2026-Jun-17 08:49:18.810817 #19 42.55 Collecting page data using 5 workers ...
2026-Jun-17 08:49:20.243282 #19 43.83 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 08:49:20.243282 #19 43.91 Generating static pages using 5 workers (28/113)
2026-Jun-17 08:49:20.395064 #19 43.98 Generating static pages using 5 workers (56/113)
2026-Jun-17 08:49:20.704752 #19 44.44 Generating static pages using 5 workers (84/113)
2026-Jun-17 08:49:20.931004 #19 44.52 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 08:49:20.931004 #19 44.52 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 08:49:20.931004 #19 44.52
2026-Jun-17 08:49:20.931004 #19 44.52
2026-Jun-17 08:49:20.931004 #19 44.52 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 08:49:20.931004 #19 44.52
2026-Jun-17 08:49:20.931004 #19 44.52 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 08:49:20.931004 #19 44.52 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 08:49:20.931004 #19 44.52 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 08:49:20.931004 #19 44.52 clientVersion: '6.19.2',
2026-Jun-17 08:49:20.931004 #19 44.52 errorCode: undefined,
2026-Jun-17 08:49:20.931004 #19 44.52 retryable: undefined
2026-Jun-17 08:49:20.931004 #19 44.52 }
2026-Jun-17 08:49:21.092416 #19 44.67 ✓ Generating static pages using 5 workers (113/113) in 836.9ms
2026-Jun-17 08:49:21.092416 #19 44.68 Finalizing page optimization ...
2026-Jun-17 08:49:21.850226 #19 45.43
2026-Jun-17 08:49:21.850226 #19 45.44 Route (app)
2026-Jun-17 08:49:21.850226 #19 45.44 ┌ ƒ /
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ○ /_not-found
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/cruceros
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/destinos
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/documentacion
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/excursiones
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/habitaciones
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/hoteles
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/login
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/marketing-modal
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/paquetes
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/resellers
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/reservas
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/revendedores
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/subagentes
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/transportes
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /admin/transportes/servicios
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/allotments
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/auth
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/auth/logout
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/bookings
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/cruises
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/destinations
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/excursions
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/help-articles
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/hotels
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/packages
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/rooms
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/stats
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/subagents
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 08:49:21.850226 #19 45.44 ├ ƒ /api/admin/transport-providers
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/admin/transport-services
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/admin/upload
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/marketing-modal
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/booking
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/cruises
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/destinations
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/excursions
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/help-articles
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/hotels
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/packages
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/stats
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/public/transport
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/auth
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/catalog
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/clients
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/commissions
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/dashboard
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/packages
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/transport
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/profile
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/register
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/sales
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/subagent/auth
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/subagent/bookings
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /api/upload
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /brand
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /contacto
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /cruceros
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /cruceros/[slug]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /destinos
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /destinos/[destinationId]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /excursiones
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /excursiones/[slug]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /hoteles
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /paquetes/[packageId]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /paquetes/armar
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog/packages
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/catalog/transport
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/clientes
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/comisiones
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/documentacion
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/login
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/productos
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/profile
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /reseller/register
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/settings
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/ventas
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/whitelabel
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /robots.txt
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /sitemap.xml
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /sobre-nosotros
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /subagent
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /subagent/clientes
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /subagent/comisiones
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /subagent/login
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /subagent/ventas
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ○ /transportes
2026-Jun-17 08:49:21.854247 #19 45.44 ├ ƒ /transportes/[serviceId]
2026-Jun-17 08:49:21.854247 #19 45.44 └ ƒ /uploads/[...path]
2026-Jun-17 08:49:21.854247 #19 45.44
2026-Jun-17 08:49:21.854247 #19 45.44
2026-Jun-17 08:49:21.854247 #19 45.44 ƒ Proxy (Middleware)
2026-Jun-17 08:49:21.854247 #19 45.44
2026-Jun-17 08:49:21.854247 #19 45.44 ○ (Static) prerendered as static content
2026-Jun-17 08:49:21.854247 #19 45.44 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 08:49:21.854247 #19 45.44
2026-Jun-17 08:49:22.146216 #19 DONE 45.7s
2026-Jun-17 08:49:38.182084 #20 [migrate runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 08:49:38.182084 #20 CACHED
2026-Jun-17 08:49:38.182084
2026-Jun-17 08:49:38.182084 #21 [migrate runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 08:49:38.182084 #21 CACHED
2026-Jun-17 08:49:38.333265 #20 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 08:49:38.333265 #20 CACHED
2026-Jun-17 08:49:38.333265
2026-Jun-17 08:49:38.333265 #21 [app runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 08:49:38.333265 #21 CACHED
2026-Jun-17 08:49:38.333265
2026-Jun-17 08:49:38.333265 #22 [migrate runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:49:39.436879 #22 DONE 1.1s
2026-Jun-17 08:49:39.436879
2026-Jun-17 08:49:39.436879 #23 [app runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:49:39.436879 #23 DONE 0.1s
2026-Jun-17 08:49:39.436879
2026-Jun-17 08:49:39.436879 #24 [migrate runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:49:39.589482 #24 DONE 0.0s
2026-Jun-17 08:49:39.589482
2026-Jun-17 08:49:39.589482 #25 [migrate runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:49:49.723634 #25 DONE 10.2s
2026-Jun-17 08:49:49.723634
2026-Jun-17 08:49:49.723634 #26 [app runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:49:49.723634 #26 DONE 0.0s
2026-Jun-17 08:49:49.723634
2026-Jun-17 08:49:49.723634 #27 [migrate runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:49:49.723634 #27 DONE 0.0s
2026-Jun-17 08:49:49.723634
2026-Jun-17 08:49:49.723634 #28 [app runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:49:49.723634 #28 DONE 0.0s
2026-Jun-17 08:49:49.723634
2026-Jun-17 08:49:49.723634 #29 [app runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:49:49.895575 #29 DONE 0.0s
2026-Jun-17 08:49:49.895575
2026-Jun-17 08:49:49.895575 #30 [migrate runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:49:49.895575 #30 DONE 0.0s
2026-Jun-17 08:49:49.895575
2026-Jun-17 08:49:49.895575 #31 [migrate runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:49:50.221899 #31 DONE 0.3s
2026-Jun-17 08:49:50.221899
2026-Jun-17 08:49:50.221899 #32 [migrate] exporting to image
2026-Jun-17 08:49:50.221899 #32 exporting layers
2026-Jun-17 08:50:00.121494 #32 ...
2026-Jun-17 08:50:00.121494
2026-Jun-17 08:50:00.121494 #33 [app] exporting to image
2026-Jun-17 08:50:06.615700 #33 ...
2026-Jun-17 08:50:06.615700
2026-Jun-17 08:50:06.615700 #32 [migrate] exporting to image
2026-Jun-17 08:50:06.615700 #32 exporting layers 16.5s done
2026-Jun-17 08:50:06.771016 #32 writing image sha256:0ba93a48d206c78a92f4a4d58cdfc20882b5ffac02e2b6dbcb6bef932430e402 done
2026-Jun-17 08:50:06.771016 #32 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:f0001f20fa7540bb13f2ff2a1f93112799186a16 done
2026-Jun-17 08:50:07.112326 #32 DONE 17.0s
2026-Jun-17 08:50:07.112326
2026-Jun-17 08:50:07.112326 #33 [app] exporting to image
2026-Jun-17 08:50:07.112326 #33 exporting layers 16.5s done
2026-Jun-17 08:50:07.112326 #33 writing image sha256:0ba93a48d206c78a92f4a4d58cdfc20882b5ffac02e2b6dbcb6bef932430e402 done
2026-Jun-17 08:50:07.112326 #33 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:f0001f20fa7540bb13f2ff2a1f93112799186a16 done
2026-Jun-17 08:50:07.178652 #33 DONE 17.0s
2026-Jun-17 08:50:07.178652
2026-Jun-17 08:50:07.178652 #34 [migrate] resolving provenance for metadata file
2026-Jun-17 08:50:07.178652 #34 DONE 0.0s
2026-Jun-17 08:50:07.178652
2026-Jun-17 08:50:07.178652 #35 [app] resolving provenance for metadata file
2026-Jun-17 08:50:07.178652 #35 DONE 0.0s
2026-Jun-17 08:50:07.183904 migrate Built
2026-Jun-17 08:50:07.183904 app Built
2026-Jun-17 08:50:07.331573 Creating .env file with runtime variables for container.
2026-Jun-17 08:50:08.492737 Removing old containers.
2026-Jun-17 08:50:08.746387 [CMD]: docker stop --time=30 app-u3lniscxtfk1klnak223ta5d-083507832485
2026-Jun-17 08:50:08.746387 app-u3lniscxtfk1klnak223ta5d-083507832485
2026-Jun-17 08:50:08.891276 [CMD]: docker rm -f app-u3lniscxtfk1klnak223ta5d-083507832485
2026-Jun-17 08:50:08.891276 app-u3lniscxtfk1klnak223ta5d-083507832485
2026-Jun-17 08:50:09.024539 [CMD]: docker stop --time=30 migrate-u3lniscxtfk1klnak223ta5d-083507824231
2026-Jun-17 08:50:09.024539 migrate-u3lniscxtfk1klnak223ta5d-083507824231
2026-Jun-17 08:50:09.164786 [CMD]: docker rm -f migrate-u3lniscxtfk1klnak223ta5d-083507824231
2026-Jun-17 08:50:09.164786 migrate-u3lniscxtfk1klnak223ta5d-083507824231
2026-Jun-17 08:50:09.574383 [CMD]: docker stop --time=30 db-u3lniscxtfk1klnak223ta5d-083507843990
2026-Jun-17 08:50:09.574383 db-u3lniscxtfk1klnak223ta5d-083507843990
2026-Jun-17 08:50:09.716923 [CMD]: docker rm -f db-u3lniscxtfk1klnak223ta5d-083507843990
2026-Jun-17 08:50:09.716923 db-u3lniscxtfk1klnak223ta5d-083507843990
2026-Jun-17 08:50:09.722946 Starting new application.
2026-Jun-17 08:50:09.986052 [CMD]: docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/yo7kb8q0umqe61h9bwp2b8wr/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/yo7kb8q0umqe61h9bwp2b8wr -f /artifacts/yo7kb8q0umqe61h9bwp2b8wr/docker-compose.yaml up -d'
2026-Jun-17 08:50:10.399435 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Creating
2026-Jun-17 08:50:10.437875 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Created
2026-Jun-17 08:50:10.437875 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Creating
2026-Jun-17 08:50:10.457657 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Created
2026-Jun-17 08:50:10.457657 Container app-u3lniscxtfk1klnak223ta5d-084830603235 Creating
2026-Jun-17 08:50:10.475580 Container app-u3lniscxtfk1klnak223ta5d-084830603235 Created
2026-Jun-17 08:50:10.481951 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Starting
2026-Jun-17 08:50:11.031921 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Started
2026-Jun-17 08:50:11.031921 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Waiting
2026-Jun-17 08:50:21.533421 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Healthy
2026-Jun-17 08:50:21.533421 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Starting
2026-Jun-17 08:50:22.142238 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Started
2026-Jun-17 08:50:22.142238 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Waiting
2026-Jun-17 08:50:22.142238 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Waiting
2026-Jun-17 08:50:22.643630 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Healthy
2026-Jun-17 08:50:25.643193 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 08:50:25.648415 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 08:50:25.648415 exit status 1
2026-Jun-17 08:50:25.703356 ========================================
2026-Jun-17 08:50:25.711422 Deployment failed: Command execution failed (exit code 1): docker exec yo7kb8q0umqe61h9bwp2b8wr bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/yo7kb8q0umqe61h9bwp2b8wr/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/yo7kb8q0umqe61h9bwp2b8wr -f /artifacts/yo7kb8q0umqe61h9bwp2b8wr/docker-compose.yaml up -d'
2026-Jun-17 08:50:25.711422 Error: Container db-u3lniscxtfk1klnak223ta5d-084830612076 Creating
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Created
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Creating
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Created
2026-Jun-17 08:50:25.711422 Container app-u3lniscxtfk1klnak223ta5d-084830603235 Creating
2026-Jun-17 08:50:25.711422 Container app-u3lniscxtfk1klnak223ta5d-084830603235 Created
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Starting
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Started
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Waiting
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Healthy
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Starting
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Started
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Waiting
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 Waiting
2026-Jun-17 08:50:25.711422 Container db-u3lniscxtfk1klnak223ta5d-084830612076 Healthy
2026-Jun-17 08:50:25.711422 Container migrate-u3lniscxtfk1klnak223ta5d-084830595744 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 08:50:25.711422 service "migrate" didn't complete successfully: exit 1
2026-Jun-17 08:50:25.711422 exit status 1
2026-Jun-17 08:50:25.719453 Error type: App\Exceptions\DeploymentException
2026-Jun-17 08:50:25.727130 Error code: 0
2026-Jun-17 08:50:25.736015 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 08:50:25.746065 Stack trace (first 5 lines):
2026-Jun-17 08:50:25.756147 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 08:50:25.765945 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 08:50:25.775395 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 08:50:25.784910 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 08:50:25.794713 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 08:50:25.804159 ========================================
2026-Jun-17 08:50:26.154230 Gracefully shutting down build container: yo7kb8q0umqe61h9bwp2b8wr
2026-Jun-17 08:50:26.420945 [CMD]: docker stop --time=30 yo7kb8q0umqe61h9bwp2b8wr
2026-Jun-17 08:50:26.420945 yo7kb8q0umqe61h9bwp2b8wr
