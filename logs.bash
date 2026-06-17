2026-Jun-17 08:01:59.117899 Docker 27.0.3 with BuildKit and Buildx detected on deployment server (localhost).
2026-Jun-17 08:01:59.124201 Starting deployment of wilrop-app to localhost.
2026-Jun-17 08:01:59.428718 Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:01:59.557240 [CMD]: docker stop --time=30 kod4x4723ke1u73uyybk2agz
2026-Jun-17 08:01:59.557240 Error response from daemon: No such container: kod4x4723ke1u73uyybk2agz
2026-Jun-17 08:01:59.696499 [CMD]: docker run -d --network 'coolify' --name kod4x4723ke1u73uyybk2agz --rm -v /root/.docker/buildx:/root/.docker/buildx -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.14
2026-Jun-17 08:01:59.696499 3ed4a8d1cf45c9099b931121eddbc40f08adbc172f0465eff1cfe3db98d00064
2026-Jun-17 08:02:02.274825 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz -o IdentitiesOnly=yes" git ls-remote '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''refs/heads/main'\'''
2026-Jun-17 08:02:02.274825 288f4ff55844e6c286ecfaf76eb92bd907fbe6a7 refs/heads/main
2026-Jun-17 08:02:02.411279 ----------------------------------------
2026-Jun-17 08:02:02.419096 Importing <REDACTED>:cambiodigital/wilrop.git:main (commit sha 288f4ff55844e6c286ecfaf76eb92bd907fbe6a7) to /artifacts/kod4x4723ke1u73uyybk2agz.
2026-Jun-17 08:02:02.775532 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'mkdir -p /root/.ssh' && docker exec kod4x4723ke1u73uyybk2agz bash -c 'echo '\''LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUFNd0FBQUF0emMyZ3RaVwpReU5UVXhPUUFBQUNBdGpRZmZmbDE4WndGNVpzUjdIbjdVd1k4b1JvQll0Vm96MjY3UmZYM1Zwd0FBQUpoRUF6OXNSQU0vCmJBQUFBQXR6YzJndFpXUXlOVFV4T1FBQUFDQXRqUWZmZmwxOFp3RjVac1I3SG43VXdZOG9Sb0JZdFZvejI2N1JmWDNWcHcKQUFBRUNiSU04czdCd2FnM20wR1ZnNllDUWpLQ1VldDFxbjJVZUp2WGVXREJpTDJ5Mk5COTkrWFh4bkFYbG14SHNlZnRUQgpqeWhHZ0ZpMVdqUGJydEY5ZmRXbkFBQUFEbU52YjJ4cFpua3RkMmxzY205d0FRSURCQVVHQnc9PQotLS0tLUVORCBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0K'\'' | base64 -d | tee /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz > /dev/null' && docker exec kod4x4723ke1u73uyybk2agz bash -c 'chmod 600 /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz' && docker exec kod4x4723ke1u73uyybk2agz bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz -o IdentitiesOnly=yes" git clone --depth=1 --recurse-submodules --shallow-submodules -b '\''main'\'' '\''<REDACTED>:cambiodigital/wilrop.git'\'' '\''/artifacts/kod4x4723ke1u73uyybk2agz'\'' && cd '\''/artifacts/kod4x4723ke1u73uyybk2agz'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz -o IdentitiesOnly=yes" git fetch --depth=1 origin '\''288f4ff55844e6c286ecfaf76eb92bd907fbe6a7'\'' && git -c advice.detachedHead=false checkout '\''288f4ff55844e6c286ecfaf76eb92bd907fbe6a7'\'' >/dev/null 2>&1 && cd '\''/artifacts/kod4x4723ke1u73uyybk2agz'\'' && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz -o IdentitiesOnly=yes" git submodule update --init --recursive --depth=1; fi && cd '\''/artifacts/kod4x4723ke1u73uyybk2agz'\'' && GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i /root/.ssh/id_rsa_coolify_kod4x4723ke1u73uyybk2agz -o IdentitiesOnly=yes" git lfs pull'
2026-Jun-17 08:02:02.775532 Cloning into '/artifacts/kod4x4723ke1u73uyybk2agz'...
2026-Jun-17 08:02:07.478253 From github.com:cambiodigital/wilrop
2026-Jun-17 08:02:07.478253 * branch 288f4ff55844e6c286ecfaf76eb92bd907fbe6a7 -> FETCH_HEAD
2026-Jun-17 08:02:09.424594 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'cd /artifacts/kod4x4723ke1u73uyybk2agz && git log -1 '\''288f4ff55844e6c286ecfaf76eb92bd907fbe6a7'\'' --pretty=%B'
2026-Jun-17 08:02:09.424594 build: add docker compose and agent docs
2026-Jun-17 08:02:09.424594
2026-Jun-17 08:02:09.424594 Add AGENTS.md containing official agent guidelines for the wilrop project, including coding standards, design system rules, and engineering practices. Add docker-compose.yaml for setting up the full containerized stack with PostgreSQL, Prisma migrations, and the Next.js application.
2026-Jun-17 08:02:14.976394 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'test -f /artifacts/kod4x4723ke1u73uyybk2agz/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:02:14.976394 exists
2026-Jun-17 08:02:15.147975 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'cat /artifacts/kod4x4723ke1u73uyybk2agz/Dockerfile'
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 WORKDIR /app
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 COPY package.json bun.lock ./
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:02:15.147975 RUN bun install --frozen-lockfile
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 FROM node:22-alpine AS builder
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 WORKDIR /app
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:02:15.147975 COPY . .
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:02:15.147975 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # Compila Next.js en modo standalone;
2026-Jun-17 08:02:15.147975 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:02:15.147975 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:02:15.147975 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:02:15.147975 && cp -r public .next/standalone/
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:02:15.147975 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 FROM node:22-alpine AS runner
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 WORKDIR /app
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 ENV NODE_ENV=production
2026-Jun-17 08:02:15.147975 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:02:15.147975 ENV PORT=3000
2026-Jun-17 08:02:15.147975 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 RUN apk add --no-cache curl
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:02:15.147975 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:02:15.147975 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:02:15.147975 # Assets estáticos
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:02:15.147975 # Archivos públicos
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:02:15.147975 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:02:15.147975 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:02:15.147975 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:02:15.147975 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.147975 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:02:15.147975 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 USER nextjs
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 EXPOSE 3000
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 LABEL traefik.enable=true
2026-Jun-17 08:02:15.147975 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:02:15.147975 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:02:15.147975
2026-Jun-17 08:02:15.147975 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:02:15.147975 CMD ["web"]
2026-Jun-17 08:02:15.323858 Added 30 ARG declarations to Dockerfile for service migrate (multi-stage build, added to 3 stages).
2026-Jun-17 08:02:15.487880 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'test -f /artifacts/kod4x4723ke1u73uyybk2agz/Dockerfile && echo '\''exists'\'' || echo '\''not found'\'''
2026-Jun-17 08:02:15.487880 exists
2026-Jun-17 08:02:15.643019 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'cat /artifacts/kod4x4723ke1u73uyybk2agz/Dockerfile'
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 # Stage 1 — deps: instala dependencias con Bun (reproducible)
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 FROM oven/bun:1-alpine AS deps
2026-Jun-17 08:02:15.643019 ARG COOLIFY_FQDN
2026-Jun-17 08:02:15.643019 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_SECRET
2026-Jun-17 08:02:15.643019 ARG DATABASE_URL
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_URL
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:02:15.643019 ARG PORT
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 WORKDIR /app
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 COPY package.json bun.lock ./
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # --frozen-lockfile garantiza reproducibilidad exacta del bun.lock
2026-Jun-17 08:02:15.643019 RUN bun install --frozen-lockfile
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 # Stage 2 — builder: genera el cliente Prisma y compila Next.js
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 FROM node:22-alpine AS builder
2026-Jun-17 08:02:15.643019 ARG COOLIFY_FQDN
2026-Jun-17 08:02:15.643019 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_SECRET
2026-Jun-17 08:02:15.643019 ARG DATABASE_URL
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_URL
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:02:15.643019 ARG PORT
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 WORKDIR /app
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:02:15.643019 COPY . .
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # Genera el cliente Prisma para la plataforma linux-musl (Alpine)
2026-Jun-17 08:02:15.643019 RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # Compila Next.js en modo standalone;
2026-Jun-17 08:02:15.643019 # el script de build también copia static/ y public/ dentro de .next/standalone/
2026-Jun-17 08:02:15.643019 RUN node /app/node_modules/next/dist/bin/next build \
2026-Jun-17 08:02:15.643019 && cp -r .next/static .next/standalone/.next/ \
2026-Jun-17 08:02:15.643019 && cp -r public .next/standalone/
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 # Stage 3 — runner: imagen de producción mínima
2026-Jun-17 08:02:15.643019 # ─────────────────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 FROM node:22-alpine AS runner
2026-Jun-17 08:02:15.643019 ARG COOLIFY_FQDN
2026-Jun-17 08:02:15.643019 ARG WILROP_SESSION_SECRET
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_SECRET
2026-Jun-17 08:02:15.643019 ARG DATABASE_URL
2026-Jun-17 08:02:15.643019 ARG NEXTAUTH_URL
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_PUBLIC_SITE_URL
2026-Jun-17 08:02:15.643019 ARG PORT
2026-Jun-17 08:02:15.643019 ARG WILROP_ADMIN_RESET_PASSWORD
2026-Jun-17 08:02:15.643019 ARG NEXT_TELEMETRY_DISABLED
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 WORKDIR /app
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 ENV NODE_ENV=production
2026-Jun-17 08:02:15.643019 ENV NEXT_TELEMETRY_DISABLED=1
2026-Jun-17 08:02:15.643019 ENV PORT=3000
2026-Jun-17 08:02:15.643019 ENV HOSTNAME="0.0.0.0"
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 RUN apk add --no-cache curl
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # Usuario no-root para seguridad (OWASP)
2026-Jun-17 08:02:15.643019 RUN addgroup --system --gid 1001 nodejs \
2026-Jun-17 08:02:15.643019 && adduser --system --uid 1001 nextjs
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # ── Next.js standalone ────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 # Incluye server.js + node_modules mínimos de Next.js
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:02:15.643019 # Assets estáticos
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:02:15.643019 # Archivos públicos
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # ── Prisma runtime ────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 # Copia node_modules completo para asegurar dependencias transitivas del CLI
2026-Jun-17 08:02:15.643019 # (por ejemplo `effect`, requerido por @prisma/config en Prisma 6.x)
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:02:15.643019 # Schema + migraciones (necesarios en runtime para migrate deploy)
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:02:15.643019 # Scripts operativos usados por el entrypoint
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:02:15.643019 COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 # ── Entrypoint ────────────────────────────────────────────────────────────────
2026-Jun-17 08:02:15.643019 COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:02:15.643019 RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 USER nextjs
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 EXPOSE 3000
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 LABEL traefik.enable=true
2026-Jun-17 08:02:15.643019 LABEL traefik.http.routers.wilrop.rule="(Host(`wilropgroup.com`) || Host(`*.wilropgroup.com`)) && PathPrefix(`/`)"
2026-Jun-17 08:02:15.643019 LABEL traefik.http.services.wilrop.loadbalancer.server.port=3000
2026-Jun-17 08:02:15.643019
2026-Jun-17 08:02:15.643019 ENTRYPOINT ["./docker-entrypoint.sh"]
2026-Jun-17 08:02:15.643019 CMD ["web"]
2026-Jun-17 08:02:15.650810 Service app: All required ARG declarations already exist.
2026-Jun-17 08:02:15.658936 Pulling & building required images.
2026-Jun-17 08:02:15.741146 Creating build-time .env file in /artifacts (outside Docker context).
2026-Jun-17 08:02:15.900141 Adding build arguments to Docker Compose build command.
2026-Jun-17 08:02:16.346794 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'DOCKER_BUILDKIT=1 COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/build-time.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/kod4x4723ke1u73uyybk2agz -f /artifacts/kod4x4723ke1u73uyybk2agz/docker-compose.yaml build --pull --build-arg COOLIFY_FQDN --build-arg WILROP_SESSION_SECRET --build-arg NEXTAUTH_SECRET --build-arg DATABASE_URL --build-arg NEXTAUTH_URL --build-arg WILROP_ADMIN_PASSWORD --build-arg NEXT_PUBLIC_SITE_URL --build-arg PORT --build-arg WILROP_ADMIN_RESET_PASSWORD --build-arg NEXT_TELEMETRY_DISABLED --build-arg COOLIFY_BUILD_SECRETS_HASH=f9dfe63d9409460f0f39f6d193f81b54dbeaae633bc13de546bcc193e4eed80e'
2026-Jun-17 08:02:16.346794 #1 [internal] load local bake definitions
2026-Jun-17 08:02:16.595904 #1 reading from stdin 2.30kB done
2026-Jun-17 08:02:16.595904 #1 DONE 0.0s
2026-Jun-17 08:02:16.595904
2026-Jun-17 08:02:16.595904 #2 [app internal] load build definition from Dockerfile
2026-Jun-17 08:02:16.595904 #2 transferring dockerfile: 5.31kB done
2026-Jun-17 08:02:16.595904 #2 DONE 0.0s
2026-Jun-17 08:02:16.595904
2026-Jun-17 08:02:16.595904 #3 [migrate internal] load build definition from Dockerfile
2026-Jun-17 08:02:16.595904 #3 transferring dockerfile: 5.31kB done
2026-Jun-17 08:02:16.595904 #3 DONE 0.0s
2026-Jun-17 08:02:16.595904
2026-Jun-17 08:02:16.595904 #4 [migrate internal] load metadata for docker.io/library/node:22-alpine
2026-Jun-17 08:02:17.360435 #4 DONE 0.9s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #5 [migrate internal] load metadata for docker.io/oven/bun:1-alpine
2026-Jun-17 08:02:17.360435 #5 DONE 0.8s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #6 [app internal] load .dockerignore
2026-Jun-17 08:02:17.360435 #6 transferring context: 1.12kB done
2026-Jun-17 08:02:17.360435 #6 DONE 0.0s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #7 [migrate internal] load .dockerignore
2026-Jun-17 08:02:17.360435 #7 transferring context: 1.12kB done
2026-Jun-17 08:02:17.360435 #7 DONE 0.0s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #8 [migrate builder 1/6] FROM docker.io/library/node:22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd
2026-Jun-17 08:02:17.360435 #8 DONE 0.0s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #9 [migrate deps 1/4] FROM docker.io/oven/bun:1-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0
2026-Jun-17 08:02:17.360435 #9 DONE 0.0s
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #10 [migrate builder 2/6] WORKDIR /app
2026-Jun-17 08:02:17.360435 #10 CACHED
2026-Jun-17 08:02:17.360435
2026-Jun-17 08:02:17.360435 #11 [app internal] load build context
2026-Jun-17 08:02:17.882722 #11 transferring context: 12.03MB 0.3s done
2026-Jun-17 08:02:17.882722 #11 DONE 0.4s
2026-Jun-17 08:02:17.882722
2026-Jun-17 08:02:17.882722 #12 [migrate deps 2/4] WORKDIR /app
2026-Jun-17 08:02:17.882722 #12 CACHED
2026-Jun-17 08:02:17.882722
2026-Jun-17 08:02:17.882722 #13 [migrate internal] load build context
2026-Jun-17 08:02:17.882722 #13 transferring context: 12.03MB 0.3s done
2026-Jun-17 08:02:17.882722 #13 DONE 0.4s
2026-Jun-17 08:02:17.882722
2026-Jun-17 08:02:17.882722 #14 [migrate deps 3/4] COPY package.json bun.lock ./
2026-Jun-17 08:02:17.882722 #14 CACHED
2026-Jun-17 08:02:17.882722
2026-Jun-17 08:02:17.882722 #15 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 08:02:18.087667 #15 0.372 bun install v1.3.14 (0d9b296a)
2026-Jun-17 08:02:20.657448 #15 ...
2026-Jun-17 08:02:20.657448
2026-Jun-17 08:02:20.657448 #16 [app runner 3/14] RUN apk add --no-cache curl
2026-Jun-17 08:02:20.657448 #16 1.359 (1/9) Installing brotli-libs (1.2.0-r1)
2026-Jun-17 08:02:20.657448 #16 1.477 (2/9) Installing c-ares (1.34.6-r0)
2026-Jun-17 08:02:20.657448 #16 1.515 (3/9) Installing libunistring (1.4.2-r0)
2026-Jun-17 08:02:20.657448 #16 1.569 (4/9) Installing libidn2 (2.3.8-r0)
2026-Jun-17 08:02:20.657448 #16 1.609 (5/9) Installing nghttp2-libs (1.69.0-r0)
2026-Jun-17 08:02:20.657448 #16 1.652 (6/9) Installing libpsl (0.21.5-r3)
2026-Jun-17 08:02:20.657448 #16 1.686 (7/9) Installing zstd-libs (1.5.7-r2)
2026-Jun-17 08:02:20.657448 #16 1.746 (8/9) Installing libcurl (8.20.0-r1)
2026-Jun-17 08:02:20.657448 #16 1.775 (9/9) Installing curl (8.20.0-r1)
2026-Jun-17 08:02:20.657448 #16 1.818 Executing busybox-1.37.0-r31.trigger
2026-Jun-17 08:02:20.657448 #16 1.859 OK: 15.9 MiB in 27 packages
2026-Jun-17 08:02:20.657448 #16 DONE 3.2s
2026-Jun-17 08:02:20.813380 #17 [app runner 4/14] RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
2026-Jun-17 08:02:21.971215 #17 DONE 1.3s
2026-Jun-17 08:02:21.971215
2026-Jun-17 08:02:21.971215 #15 [migrate deps 4/4] RUN bun install --frozen-lockfile
2026-Jun-17 08:02:26.442138 #15 8.726
2026-Jun-17 08:02:26.442138 #15 8.726 + @tailwindcss/postcss@4.1.18
2026-Jun-17 08:02:26.442138 #15 8.726 + @types/react@19.2.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @types/react-dom@19.2.3
2026-Jun-17 08:02:26.442138 #15 8.726 + bun-types@1.3.6
2026-Jun-17 08:02:26.442138 #15 8.726 + eslint@9.39.2
2026-Jun-17 08:02:26.442138 #15 8.726 + eslint-config-next@16.1.3
2026-Jun-17 08:02:26.442138 #15 8.726 + tailwindcss@4.1.18
2026-Jun-17 08:02:26.442138 #15 8.726 + tw-animate-css@1.4.0
2026-Jun-17 08:02:26.442138 #15 8.726 + typescript@5.9.3
2026-Jun-17 08:02:26.442138 #15 8.726 + @dnd-kit/core@6.3.1
2026-Jun-17 08:02:26.442138 #15 8.726 + @dnd-kit/sortable@10.0.0
2026-Jun-17 08:02:26.442138 #15 8.726 + @dnd-kit/utilities@3.2.2
2026-Jun-17 08:02:26.442138 #15 8.726 + @hookform/resolvers@5.2.2
2026-Jun-17 08:02:26.442138 #15 8.726 + @mdxeditor/editor@3.52.3
2026-Jun-17 08:02:26.442138 #15 8.726 + @prisma/client@6.19.2
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-accordion@1.2.12
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-alert-dialog@1.1.15
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-aspect-ratio@1.1.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-avatar@1.1.11
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-checkbox@1.3.3
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-collapsible@1.1.12
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-context-menu@2.2.16
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-dialog@1.1.15
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-dropdown-menu@2.1.16
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-hover-card@1.1.15
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-label@2.1.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-menubar@1.1.16
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-navigation-menu@1.2.14
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-popover@1.1.15
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-progress@1.1.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-radio-group@1.3.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-scroll-area@1.2.10
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-select@2.2.6
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-separator@1.1.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-slider@1.3.6
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-slot@1.2.4
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-switch@1.2.6
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-tabs@1.1.13
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-toast@1.2.15
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-toggle@1.1.10
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-toggle-group@1.1.11
2026-Jun-17 08:02:26.442138 #15 8.726 + @radix-ui/react-tooltip@1.2.8
2026-Jun-17 08:02:26.442138 #15 8.726 + @reactuses/core@6.1.9
2026-Jun-17 08:02:26.442138 #15 8.726 + @tanstack/react-query@5.90.19
2026-Jun-17 08:02:26.442138 #15 8.726 + @tanstack/react-table@8.21.3
2026-Jun-17 08:02:26.442138 #15 8.726 + bcryptjs@3.0.3
2026-Jun-17 08:02:26.442138 #15 8.726 + class-variance-authority@0.7.1
2026-Jun-17 08:02:26.442138 #15 8.726 + clsx@2.1.1
2026-Jun-17 08:02:26.442138 #15 8.726 + cmdk@1.1.1
2026-Jun-17 08:02:26.442138 #15 8.726 + date-fns@4.1.0
2026-Jun-17 08:02:26.442138 #15 8.726 + embla-carousel-react@8.6.0
2026-Jun-17 08:02:26.442138 #15 8.726 + framer-motion@12.26.2
2026-Jun-17 08:02:26.442138 #15 8.726 + input-otp@1.4.2
2026-Jun-17 08:02:26.442138 #15 8.726 + lucide-react@0.525.0
2026-Jun-17 08:02:26.442138 #15 8.726 + next@16.1.3
2026-Jun-17 08:02:26.442138 #15 8.726 + next-auth@4.24.13
2026-Jun-17 08:02:26.442138 #15 8.726 + next-intl@4.7.0
2026-Jun-17 08:02:26.442138 #15 8.726 + next-themes@0.4.6
2026-Jun-17 08:02:26.442138 #15 8.726 + prisma@6.19.2
2026-Jun-17 08:02:26.442138 #15 8.726 + react@19.2.3
2026-Jun-17 08:02:26.442138 #15 8.726 + react-day-picker@9.13.0
2026-Jun-17 08:02:26.442138 #15 8.726 + react-dom@19.2.3
2026-Jun-17 08:02:26.442138 #15 8.726 + react-hook-form@7.71.1
2026-Jun-17 08:02:26.442138 #15 8.726 + react-markdown@10.1.0
2026-Jun-17 08:02:26.442138 #15 8.726 + react-resizable-panels@3.0.6
2026-Jun-17 08:02:26.442138 #15 8.726 + react-syntax-highlighter@15.6.6
2026-Jun-17 08:02:26.442138 #15 8.726 + recharts@2.15.4
2026-Jun-17 08:02:26.442138 #15 8.726 + sharp@0.34.5
2026-Jun-17 08:02:26.442138 #15 8.726 + socket.io@4.8.3
2026-Jun-17 08:02:26.442138 #15 8.726 + socket.io-client@4.8.3
2026-Jun-17 08:02:26.442138 #15 8.726 + sonner@2.0.7
2026-Jun-17 08:02:26.442138 #15 8.726 + tailwind-merge@3.4.0
2026-Jun-17 08:02:26.442138 #15 8.726 + tailwindcss-animate@1.0.7
2026-Jun-17 08:02:26.442138 #15 8.726 + uuid@11.1.0
2026-Jun-17 08:02:26.442138 #15 8.726 + vaul@1.1.2
2026-Jun-17 08:02:26.442138 #15 8.726 + z-ai-web-dev-sdk@0.0.17
2026-Jun-17 08:02:26.442138 #15 8.726 + zod@4.3.5
2026-Jun-17 08:02:26.442138 #15 8.726 + zustand@5.0.10
2026-Jun-17 08:02:26.442138 #15 8.726
2026-Jun-17 08:02:26.442138 #15 8.726 847 packages installed [8.37s]
2026-Jun-17 08:02:26.792341 #15 DONE 8.9s
2026-Jun-17 08:02:38.447375 #18 [app builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:02:38.447375 #18 CACHED
2026-Jun-17 08:02:38.574731 #18 [migrate builder 3/6] COPY --from=deps /app/node_modules ./node_modules
2026-Jun-17 08:02:38.574731 #18 CACHED
2026-Jun-17 08:02:38.574731
2026-Jun-17 08:02:38.574731 #19 [migrate builder 4/6] COPY . .
2026-Jun-17 08:02:38.968861 #19 DONE 0.2s
2026-Jun-17 08:02:38.968861
2026-Jun-17 08:02:38.968861 #20 [migrate builder 5/6] RUN node /app/node_modules/prisma/build/index.js generate
2026-Jun-17 08:02:40.455624 #20 1.640 Prisma schema loaded from prisma/schema.prisma
2026-Jun-17 08:02:41.775834 #20 2.749
2026-Jun-17 08:02:41.775834 #20 2.749 ✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 386ms
2026-Jun-17 08:02:41.775834 #20 2.749
2026-Jun-17 08:02:41.775834 #20 2.749 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
2026-Jun-17 08:02:41.775834 #20 2.749
2026-Jun-17 08:02:41.775834 #20 2.749 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
2026-Jun-17 08:02:41.775834 #20 2.749
2026-Jun-17 08:02:41.775834 #20 DONE 2.8s
2026-Jun-17 08:02:41.775834
2026-Jun-17 08:02:41.775834 #21 [migrate builder 6/6] RUN node /app/node_modules/next/dist/bin/next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
2026-Jun-17 08:02:43.348849 #21 1.724 ▲ Next.js 16.1.3 (Turbopack)
2026-Jun-17 08:02:43.577400 #21 1.724
2026-Jun-17 08:02:43.577400 #21 1.802 Creating an optimized production build ...
2026-Jun-17 08:03:01.544958 #21 19.87 ✓ Compiled successfully in 17.3s
2026-Jun-17 08:03:01.695463 #21 19.89 Running TypeScript ...
2026-Jun-17 08:03:26.015997 #21 44.24 Collecting page data using 5 workers ...
2026-Jun-17 08:03:27.312375 #21 45.54 Generating static pages using 5 workers (0/113) ...
2026-Jun-17 08:03:27.312375 #21 45.60 Generating static pages using 5 workers (28/113)
2026-Jun-17 08:03:27.462861 #21 45.69 Generating static pages using 5 workers (56/113)
2026-Jun-17 08:03:27.853064 #21 46.23 Error generating sitemap dynamic paths: Error [PrismaClientInitializationError]:
2026-Jun-17 08:03:27.853064 #21 46.23 Invalid `prisma.destination.count()` invocation:
2026-Jun-17 08:03:27.853064 #21 46.23
2026-Jun-17 08:03:27.853064 #21 46.23
2026-Jun-17 08:03:27.853064 #21 46.23 Can't reach database server at `vegu2zz4l0jkzpozriu0qxku:5432`
2026-Jun-17 08:03:27.853064 #21 46.23
2026-Jun-17 08:03:27.853064 #21 46.23 Please make sure your database server is running at `vegu2zz4l0jkzpozriu0qxku:5432`.
2026-Jun-17 08:03:27.853064 #21 46.23 at async b (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:1111)
2026-Jun-17 08:03:27.853064 #21 46.23 at async _ (.next/server/chunks/[root-of-the-server]__ef8d65db._.js:16:2365) {
2026-Jun-17 08:03:27.853064 #21 46.23 clientVersion: '6.19.2',
2026-Jun-17 08:03:27.853064 #21 46.23 errorCode: undefined,
2026-Jun-17 08:03:27.853064 #21 46.23 retryable: undefined
2026-Jun-17 08:03:27.853064 #21 46.23 }
2026-Jun-17 08:03:28.045056 #21 46.27 Generating static pages using 5 workers (84/113)
2026-Jun-17 08:03:28.217783 #21 46.43 ✓ Generating static pages using 5 workers (113/113) in 887.5ms
2026-Jun-17 08:03:28.217783 #21 46.44 Finalizing page optimization ...
2026-Jun-17 08:03:29.045625 #21 47.26
2026-Jun-17 08:03:29.045625 #21 47.27 Route (app)
2026-Jun-17 08:03:29.045625 #21 47.27 ┌ ƒ /
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /_not-found
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/cruceros
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/destinos
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/documentacion
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/excursiones
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/excursiones/[excursionId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/habitaciones
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/hoteles
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/hoteles/[hotelId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/login
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/marketing-modal
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/paquetes
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/paquetes-personalizados
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/paquetes/[packageId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/resellers
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/reservas
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/reservas/[bookingId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/revendedores
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/subagentes
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/subagentes/[subagentId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/transportes
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/transportes/proveedores
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /admin/transportes/servicios
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/allotments
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/allotments/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/auth
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/auth/logout
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/bookings
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/bookings/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/cruises
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/cruises/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/destinations
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/destinations/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/destinations/[id]/relations
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/excursions
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/excursions/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/help-articles
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/help-articles/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/hotels
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/hotels/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/marketing-modal
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/packages
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/packages/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/packages/[id]/relations
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/destinations
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/excursions
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/hotels
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/packages
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/room-types
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/relation-options/transport-services
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers/[id]/approval
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers/[id]/approve
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers/[id]/reject
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/resellers/[id]/stats
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/rooms
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/rooms/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/stats
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/subagents
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/subagents/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/subagents/[id]/approval
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/transport-providers
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/transport-providers/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/transport-services
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/transport-services/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/upload
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/admin/uploads/[...path]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/marketing-modal
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/booking
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/cruises
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/cruises/[slug]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/destinations
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/excursions
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/help-articles
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/hotels
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/packages
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/reseller-resolve
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/reseller-resolve/check-domain
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/stats
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/public/transport
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/auth
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/auth/logout
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/catalog
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/catalog/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/catalog/[id]/toggle-featured
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/catalog/available
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/clients
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/clients/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/commissions
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/dashboard
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/cruises
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/cruises/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/excursions
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/excursions/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/hotel-rooms
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/hotel-rooms/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/hotels
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/hotels/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/packages
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/packages/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/transport
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/products/transport/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/profile
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/register
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/sales
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/sales/[id]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/transport-providers
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/reseller/whitelabel
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/subagent/auth
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/subagent/auth/logout
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/subagent/bookings
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /api/upload
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /brand
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /contacto
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /cruceros
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /cruceros/[slug]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /cruceros/[slug]/reserva
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /destinos
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /destinos/[destinationId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /excursiones
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /excursiones/[slug]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /hoteles
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /hoteles/[hotelId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /hoteles/[hotelId]/reserva
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /paquetes/[packageId]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /paquetes/[packageId]/reserva
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ○ /paquetes/armar
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /pedidos/[bookingCode]
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /reseller
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /reseller/catalog
2026-Jun-17 08:03:29.045625 #21 47.27 ├ ƒ /reseller/catalog/destinations
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/catalog/excursions
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/catalog/hotels
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/catalog/packages
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/catalog/transport
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/clientes
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/comisiones
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/documentacion
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/login
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/productos
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/profile
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ○ /reseller/register
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/settings
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/ventas
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/whitelabel
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /reseller/whitelabel/preview
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ○ /robots.txt
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ○ /sitemap.xml
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ○ /sobre-nosotros
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /subagent
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /subagent/clientes
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /subagent/comisiones
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /subagent/login
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /subagent/ventas
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ○ /transportes
2026-Jun-17 08:03:29.050150 #21 47.27 ├ ƒ /transportes/[serviceId]
2026-Jun-17 08:03:29.050150 #21 47.27 └ ƒ /uploads/[...path]
2026-Jun-17 08:03:29.050150 #21 47.27
2026-Jun-17 08:03:29.050150 #21 47.27
2026-Jun-17 08:03:29.050150 #21 47.27 ƒ Proxy (Middleware)
2026-Jun-17 08:03:29.050150 #21 47.27
2026-Jun-17 08:03:29.050150 #21 47.27 ○ (Static) prerendered as static content
2026-Jun-17 08:03:29.050150 #21 47.27 ƒ (Dynamic) server-rendered on demand
2026-Jun-17 08:03:29.050150 #21 47.27
2026-Jun-17 08:03:29.329574 #21 DONE 47.6s
2026-Jun-17 08:03:29.609650 #22 [app runner 5/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
2026-Jun-17 08:03:30.779253 #22 DONE 1.0s
2026-Jun-17 08:03:30.779253
2026-Jun-17 08:03:30.779253 #23 [app runner 6/14] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
2026-Jun-17 08:03:30.779253 #23 DONE 0.0s
2026-Jun-17 08:03:43.869968 #24 [app runner 7/14] COPY --from=builder --chown=nextjs:nodejs /app/public ./public
2026-Jun-17 08:03:44.288421 #24 DONE 0.3s
2026-Jun-17 08:03:44.288421
2026-Jun-17 08:03:44.288421 #25 [migrate runner 8/14] COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
2026-Jun-17 08:03:56.831161 #25 DONE 12.6s
2026-Jun-17 08:03:56.831161
2026-Jun-17 08:03:56.831161 #26 [migrate runner 9/14] COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
2026-Jun-17 08:03:56.831161 #26 DONE 0.0s
2026-Jun-17 08:03:56.831161
2026-Jun-17 08:03:56.831161 #27 [migrate runner 10/14] COPY --from=builder --chown=nextjs:nodejs /app/scripts/ensure-admin.mjs ./scripts/ensure-admin.mjs
2026-Jun-17 08:03:56.831161 #27 DONE 0.0s
2026-Jun-17 08:03:56.831161
2026-Jun-17 08:03:56.831161 #28 [app runner 11/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/password.mjs ./src/lib/password.mjs
2026-Jun-17 08:03:56.831161 #28 DONE 0.0s
2026-Jun-17 08:03:56.831161
2026-Jun-17 08:03:56.831161 #29 [migrate runner 12/14] COPY --from=builder --chown=nextjs:nodejs /app/src/lib/secure-compare.mjs ./src/lib/secure-compare.mjs
2026-Jun-17 08:03:57.012521 #29 DONE 0.0s
2026-Jun-17 08:03:57.012521
2026-Jun-17 08:03:57.012521 #30 [app runner 13/14] COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
2026-Jun-17 08:03:57.012521 #30 DONE 0.0s
2026-Jun-17 08:03:57.012521
2026-Jun-17 08:03:57.012521 #31 [migrate runner 14/14] RUN chmod +x docker-entrypoint.sh
2026-Jun-17 08:03:57.375255 #31 DONE 0.4s
2026-Jun-17 08:03:57.375255
2026-Jun-17 08:03:57.375255 #32 [migrate] exporting to image
2026-Jun-17 08:03:57.375255 #32 exporting layers
2026-Jun-17 08:04:07.275573 #32 ...
2026-Jun-17 08:04:07.275573
2026-Jun-17 08:04:07.275573 #33 [app] exporting to image
2026-Jun-17 08:04:14.539032 #33 ...
2026-Jun-17 08:04:14.539032
2026-Jun-17 08:04:14.539032 #32 [migrate] exporting to image
2026-Jun-17 08:04:14.539032 #32 exporting layers 17.3s done
2026-Jun-17 08:04:14.695002 #32 writing image sha256:5b470ab7bb4ee1ec42a13643e1dbcc01d4350c2282f07619ede66fc798c0adbb done
2026-Jun-17 08:04:14.695002 #32 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_migrate:288f4ff55844e6c286ecfaf76eb92bd907fbe6a7 done
2026-Jun-17 08:04:14.873433 #32 ...
2026-Jun-17 08:04:14.873433
2026-Jun-17 08:04:14.873433 #33 [app] exporting to image
2026-Jun-17 08:04:14.873433 #33 exporting layers 17.3s done
2026-Jun-17 08:04:14.873433 #33 writing image sha256:5b470ab7bb4ee1ec42a13643e1dbcc01d4350c2282f07619ede66fc798c0adbb done
2026-Jun-17 08:04:14.873433 #33 naming to docker.io/library/u3lniscxtfk1klnak223ta5d_app:288f4ff55844e6c286ecfaf76eb92bd907fbe6a7 done
2026-Jun-17 08:04:14.873433 #33 DONE 17.7s
2026-Jun-17 08:04:14.978599 #32 [migrate] exporting to image
2026-Jun-17 08:04:14.978599 #32 DONE 17.7s
2026-Jun-17 08:04:14.978599
2026-Jun-17 08:04:14.978599 #34 [app] resolving provenance for metadata file
2026-Jun-17 08:04:14.978599 #34 DONE 0.0s
2026-Jun-17 08:04:14.978599
2026-Jun-17 08:04:14.978599 #35 [migrate] resolving provenance for metadata file
2026-Jun-17 08:04:14.978599 #35 DONE 0.0s
2026-Jun-17 08:04:14.983721 app Built
2026-Jun-17 08:04:14.983721 migrate Built
2026-Jun-17 08:04:15.147297 Creating .env file with runtime variables for container.
2026-Jun-17 08:04:15.500534 Removing old containers.
2026-Jun-17 08:04:16.035475 [CMD]: docker stop --time=30 u3lniscxtfk1klnak223ta5d-073927945347
2026-Jun-17 08:04:16.035475 u3lniscxtfk1klnak223ta5d-073927945347
2026-Jun-17 08:04:16.182212 [CMD]: docker rm -f u3lniscxtfk1klnak223ta5d-073927945347
2026-Jun-17 08:04:16.182212 u3lniscxtfk1klnak223ta5d-073927945347
2026-Jun-17 08:04:16.188855 Starting new application.
2026-Jun-17 08:04:16.655887 [CMD]: docker exec kod4x4723ke1u73uyybk2agz bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/kod4x4723ke1u73uyybk2agz/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/kod4x4723ke1u73uyybk2agz -f /artifacts/kod4x4723ke1u73uyybk2agz/docker-compose.yaml up -d'
2026-Jun-17 08:04:17.119914 db Pulling
2026-Jun-17 08:04:19.320162 55afa1ecc21d Already exists
2026-Jun-17 08:04:19.325209 6c2eaa02a04a Pulling fs layer
2026-Jun-17 08:04:19.325209 0d4fedf9cad8 Pulling fs layer
2026-Jun-17 08:04:19.325209 f7f6aac6fe13 Pulling fs layer
2026-Jun-17 08:04:19.325209 f2511ae13411 Pulling fs layer
2026-Jun-17 08:04:19.325209 f63c7a8df82b Pulling fs layer
2026-Jun-17 08:04:19.325209 ecbe26720671 Pulling fs layer
2026-Jun-17 08:04:19.325209 ddab922e8d89 Pulling fs layer
2026-Jun-17 08:04:19.325209 95e4c51fed83 Pulling fs layer
2026-Jun-17 08:04:19.325209 5de95df2a1fb Pulling fs layer
2026-Jun-17 08:04:19.325209 d84bc3f3ded6 Pulling fs layer
2026-Jun-17 08:04:19.325209 f63c7a8df82b Waiting
2026-Jun-17 08:04:19.325209 ecbe26720671 Waiting
2026-Jun-17 08:04:19.325209 ddab922e8d89 Waiting
2026-Jun-17 08:04:19.325209 95e4c51fed83 Waiting
2026-Jun-17 08:04:19.325209 5de95df2a1fb Waiting
2026-Jun-17 08:04:19.325209 d84bc3f3ded6 Waiting
2026-Jun-17 08:04:19.325209 f2511ae13411 Waiting
2026-Jun-17 08:04:19.868682 6c2eaa02a04a Downloading [==================================================>] 970B/970B
2026-Jun-17 08:04:19.868682 6c2eaa02a04a Verifying Checksum
2026-Jun-17 08:04:19.868682 6c2eaa02a04a Download complete
2026-Jun-17 08:04:19.868682 6c2eaa02a04a Extracting [==================================================>] 970B/970B
2026-Jun-17 08:04:19.874680 6c2eaa02a04a Extracting [==================================================>] 970B/970B
2026-Jun-17 08:04:19.874680 f7f6aac6fe13 Downloading [==================================================>] 171B/171B
2026-Jun-17 08:04:19.874680 f7f6aac6fe13 Verifying Checksum
2026-Jun-17 08:04:19.874680 f7f6aac6fe13 Download complete
2026-Jun-17 08:04:19.874680 0d4fedf9cad8 Downloading [> ] 15.79kB/900.3kB
2026-Jun-17 08:04:19.891616 6c2eaa02a04a Pull complete
2026-Jun-17 08:04:19.942606 0d4fedf9cad8 Downloading [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:04:19.942606 0d4fedf9cad8 Verifying Checksum
2026-Jun-17 08:04:19.942606 0d4fedf9cad8 Download complete
2026-Jun-17 08:04:19.942606 0d4fedf9cad8 Extracting [=> ] 32.77kB/900.3kB
2026-Jun-17 08:04:19.968316 0d4fedf9cad8 Extracting [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:04:19.973190 0d4fedf9cad8 Extracting [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:04:19.978472 0d4fedf9cad8 Pull complete
2026-Jun-17 08:04:19.978472 f7f6aac6fe13 Extracting [==================================================>] 171B/171B
2026-Jun-17 08:04:19.978472 f7f6aac6fe13 Extracting [==================================================>] 171B/171B
2026-Jun-17 08:04:19.990718 f7f6aac6fe13 Pull complete
2026-Jun-17 08:04:20.385212 f2511ae13411 Downloading [==================================================>] 116B/116B
2026-Jun-17 08:04:20.385212 f2511ae13411 Verifying Checksum
2026-Jun-17 08:04:20.385212 f2511ae13411 Download complete
2026-Jun-17 08:04:20.385212 f2511ae13411 Extracting [==================================================>] 116B/116B
2026-Jun-17 08:04:20.390676 f2511ae13411 Extracting [==================================================>] 116B/116B
2026-Jun-17 08:04:20.397836 f2511ae13411 Pull complete
2026-Jun-17 08:04:20.460958 f63c7a8df82b Downloading [> ] 530kB/111.3MB
2026-Jun-17 08:04:20.468541 ecbe26720671 Downloading [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:04:20.468541 ecbe26720671 Verifying Checksum
2026-Jun-17 08:04:20.468541 ecbe26720671 Download complete
2026-Jun-17 08:04:20.561825 f63c7a8df82b Downloading [======> ] 13.87MB/111.3MB
2026-Jun-17 08:04:20.664307 f63c7a8df82b Downloading [==============> ] 32.41MB/111.3MB
2026-Jun-17 08:04:20.764413 f63c7a8df82b Downloading [======================> ] 50.48MB/111.3MB
2026-Jun-17 08:04:20.866647 f63c7a8df82b Downloading [===============================> ] 69.02MB/111.3MB
2026-Jun-17 08:04:20.891604 ddab922e8d89 Downloading [==================================================>] 129B/129B
2026-Jun-17 08:04:20.891604 ddab922e8d89 Verifying Checksum
2026-Jun-17 08:04:20.891604 ddab922e8d89 Download complete
2026-Jun-17 08:04:20.969723 f63c7a8df82b Downloading [=======================================> ] 87.59MB/111.3MB
2026-Jun-17 08:04:20.980389 95e4c51fed83 Download complete
2026-Jun-17 08:04:21.072154 f63c7a8df82b Downloading [===============================================> ] 106.2MB/111.3MB
2026-Jun-17 08:04:21.100314 f63c7a8df82b Verifying Checksum
2026-Jun-17 08:04:21.100314 f63c7a8df82b Download complete
2026-Jun-17 08:04:21.110788 f63c7a8df82b Extracting [> ] 557.1kB/111.3MB
2026-Jun-17 08:04:21.219726 f63c7a8df82b Extracting [=> ] 3.899MB/111.3MB
2026-Jun-17 08:04:21.324737 f63c7a8df82b Extracting [=====> ] 11.7MB/111.3MB
2026-Jun-17 08:04:21.413487 5de95df2a1fb Downloading [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:04:21.413487 5de95df2a1fb Verifying Checksum
2026-Jun-17 08:04:21.429137 f63c7a8df82b Extracting [=========> ] 20.61MB/111.3MB
2026-Jun-17 08:04:21.501225 d84bc3f3ded6 Downloading [==================================================>] 185B/185B
2026-Jun-17 08:04:21.501225 d84bc3f3ded6 Verifying Checksum
2026-Jun-17 08:04:21.501225 d84bc3f3ded6 Download complete
2026-Jun-17 08:04:21.531512 f63c7a8df82b Extracting [=============> ] 28.97MB/111.3MB
2026-Jun-17 08:04:21.637708 f63c7a8df82b Extracting [================> ] 37.32MB/111.3MB
2026-Jun-17 08:04:21.740589 f63c7a8df82b Extracting [====================> ] 45.12MB/111.3MB
2026-Jun-17 08:04:21.844088 f63c7a8df82b Extracting [========================> ] 53.48MB/111.3MB
2026-Jun-17 08:04:21.950917 f63c7a8df82b Extracting [=========================> ] 57.38MB/111.3MB
2026-Jun-17 08:04:22.060207 f63c7a8df82b Extracting [===========================> ] 61.28MB/111.3MB
2026-Jun-17 08:04:22.165617 f63c7a8df82b Extracting [==============================> ] 67.96MB/111.3MB
2026-Jun-17 08:04:22.268659 f63c7a8df82b Extracting [=================================> ] 74.65MB/111.3MB
2026-Jun-17 08:04:22.394796 f63c7a8df82b Extracting [====================================> ] 80.77MB/111.3MB
2026-Jun-17 08:04:22.531540 f63c7a8df82b Extracting [====================================> ] 81.33MB/111.3MB
2026-Jun-17 08:04:22.652036 f63c7a8df82b Extracting [=====================================> ] 82.44MB/111.3MB
2026-Jun-17 08:04:22.774907 f63c7a8df82b Extracting [======================================> ] 85.23MB/111.3MB
2026-Jun-17 08:04:22.882900 f63c7a8df82b Extracting [========================================> ] 89.69MB/111.3MB
2026-Jun-17 08:04:22.986500 f63c7a8df82b Extracting [==========================================> ] 93.59MB/111.3MB
2026-Jun-17 08:04:23.145199 f63c7a8df82b Extracting [============================================> ] 98.04MB/111.3MB
2026-Jun-17 08:04:23.247009 f63c7a8df82b Extracting [================================================> ] 107.5MB/111.3MB
2026-Jun-17 08:04:23.322865 f63c7a8df82b Extracting [==================================================>] 111.3MB/111.3MB
2026-Jun-17 08:04:23.462074 f63c7a8df82b Pull complete
2026-Jun-17 08:04:23.468577 ecbe26720671 Extracting [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:04:23.468577 ecbe26720671 Extracting [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:04:23.479614 ecbe26720671 Pull complete
2026-Jun-17 08:04:23.484338 ddab922e8d89 Extracting [==================================================>] 129B/129B
2026-Jun-17 08:04:23.484338 ddab922e8d89 Extracting [==================================================>] 129B/129B
2026-Jun-17 08:04:23.489408 ddab922e8d89 Pull complete
2026-Jun-17 08:04:23.494037 95e4c51fed83 Extracting [==================================================>] 170B/170B
2026-Jun-17 08:04:23.494037 95e4c51fed83 Extracting [==================================================>] 170B/170B
2026-Jun-17 08:04:23.500188 95e4c51fed83 Pull complete
2026-Jun-17 08:04:23.504783 5de95df2a1fb Extracting [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:04:23.504783 5de95df2a1fb Extracting [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:04:23.512119 5de95df2a1fb Pull complete
2026-Jun-17 08:04:23.516856 d84bc3f3ded6 Extracting [==================================================>] 185B/185B
2026-Jun-17 08:04:23.516856 d84bc3f3ded6 Extracting [==================================================>] 185B/185B
2026-Jun-17 08:04:23.524185 d84bc3f3ded6 Pull complete
2026-Jun-17 08:04:23.532123 db Pulled
2026-Jun-17 08:04:23.537260 Network u3lniscxtfk1klnak223ta5d_wilrop-net Creating
2026-Jun-17 08:04:23.643042 Network u3lniscxtfk1klnak223ta5d_wilrop-net Created
2026-Jun-17 08:04:23.648899 Volume "u3lniscxtfk1klnak223ta5d_wilrop-uploads" Creating
2026-Jun-17 08:04:23.655444 Volume "u3lniscxtfk1klnak223ta5d_wilrop-uploads" Created
2026-Jun-17 08:04:23.655444 Volume "u3lniscxtfk1klnak223ta5d_wilrop-db-data" Creating
2026-Jun-17 08:04:23.655444 Volume "u3lniscxtfk1klnak223ta5d_wilrop-db-data" Created
2026-Jun-17 08:04:23.655444 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Creating
2026-Jun-17 08:04:23.869544 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Created
2026-Jun-17 08:04:23.869544 Container migrate-u3lniscxtfk1klnak223ta5d-080214623259 Creating
2026-Jun-17 08:04:23.887711 Container migrate-u3lniscxtfk1klnak223ta5d-080214623259 Created
2026-Jun-17 08:04:23.887711 Container app-u3lniscxtfk1klnak223ta5d-080214631152 Creating
2026-Jun-17 08:04:23.905060 Container app-u3lniscxtfk1klnak223ta5d-080214631152 Created
2026-Jun-17 08:04:23.910284 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Starting
2026-Jun-17 08:04:24.445368 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Started
2026-Jun-17 08:04:24.445368 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Waiting
2026-Jun-17 08:05:14.946843 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Error
2026-Jun-17 08:05:14.953422 dependency failed to start: container db-u3lniscxtfk1klnak223ta5d-080214640096 is unhealthy
2026-Jun-17 08:05:14.953422 exit status 1
2026-Jun-17 08:05:15.008843 ========================================
2026-Jun-17 08:05:15.019711 Deployment failed: Command execution failed (exit code 1): docker exec kod4x4723ke1u73uyybk2agz bash -c 'COOLIFY_BRANCH='\''main'\'' COOLIFY_RESOURCE_UUID=u3lniscxtfk1klnak223ta5d docker compose --env-file /artifacts/kod4x4723ke1u73uyybk2agz/.env --project-name u3lniscxtfk1klnak223ta5d --project-directory /artifacts/kod4x4723ke1u73uyybk2agz -f /artifacts/kod4x4723ke1u73uyybk2agz/docker-compose.yaml up -d'
2026-Jun-17 08:05:15.019711 Error: db Pulling
2026-Jun-17 08:05:15.019711 55afa1ecc21d Already exists
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Pulling fs layer
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Pulling fs layer
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Pulling fs layer
2026-Jun-17 08:05:15.019711 f2511ae13411 Pulling fs layer
2026-Jun-17 08:05:15.019711 f63c7a8df82b Pulling fs layer
2026-Jun-17 08:05:15.019711 ecbe26720671 Pulling fs layer
2026-Jun-17 08:05:15.019711 ddab922e8d89 Pulling fs layer
2026-Jun-17 08:05:15.019711 95e4c51fed83 Pulling fs layer
2026-Jun-17 08:05:15.019711 5de95df2a1fb Pulling fs layer
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Pulling fs layer
2026-Jun-17 08:05:15.019711 f63c7a8df82b Waiting
2026-Jun-17 08:05:15.019711 ecbe26720671 Waiting
2026-Jun-17 08:05:15.019711 ddab922e8d89 Waiting
2026-Jun-17 08:05:15.019711 95e4c51fed83 Waiting
2026-Jun-17 08:05:15.019711 5de95df2a1fb Waiting
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Waiting
2026-Jun-17 08:05:15.019711 f2511ae13411 Waiting
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Downloading [==================================================>] 970B/970B
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Verifying Checksum
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Download complete
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Extracting [==================================================>] 970B/970B
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Extracting [==================================================>] 970B/970B
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Downloading [==================================================>] 171B/171B
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Verifying Checksum
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Download complete
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Downloading [> ] 15.79kB/900.3kB
2026-Jun-17 08:05:15.019711 6c2eaa02a04a Pull complete
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Downloading [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Verifying Checksum
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Download complete
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Extracting [=> ] 32.77kB/900.3kB
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Extracting [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Extracting [==================================================>] 900.3kB/900.3kB
2026-Jun-17 08:05:15.019711 0d4fedf9cad8 Pull complete
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Extracting [==================================================>] 171B/171B
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Extracting [==================================================>] 171B/171B
2026-Jun-17 08:05:15.019711 f7f6aac6fe13 Pull complete
2026-Jun-17 08:05:15.019711 f2511ae13411 Downloading [==================================================>] 116B/116B
2026-Jun-17 08:05:15.019711 f2511ae13411 Verifying Checksum
2026-Jun-17 08:05:15.019711 f2511ae13411 Download complete
2026-Jun-17 08:05:15.019711 f2511ae13411 Extracting [==================================================>] 116B/116B
2026-Jun-17 08:05:15.019711 f2511ae13411 Extracting [==================================================>] 116B/116B
2026-Jun-17 08:05:15.019711 f2511ae13411 Pull complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [> ] 530kB/111.3MB
2026-Jun-17 08:05:15.019711 ecbe26720671 Downloading [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:05:15.019711 ecbe26720671 Verifying Checksum
2026-Jun-17 08:05:15.019711 ecbe26720671 Download complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [======> ] 13.87MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [==============> ] 32.41MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [======================> ] 50.48MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [===============================> ] 69.02MB/111.3MB
2026-Jun-17 08:05:15.019711 ddab922e8d89 Downloading [==================================================>] 129B/129B
2026-Jun-17 08:05:15.019711 ddab922e8d89 Verifying Checksum
2026-Jun-17 08:05:15.019711 ddab922e8d89 Download complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [=======================================> ] 87.59MB/111.3MB
2026-Jun-17 08:05:15.019711 95e4c51fed83 Download complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Downloading [===============================================> ] 106.2MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Verifying Checksum
2026-Jun-17 08:05:15.019711 f63c7a8df82b Download complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [> ] 557.1kB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=> ] 3.899MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=====> ] 11.7MB/111.3MB
2026-Jun-17 08:05:15.019711 5de95df2a1fb Downloading [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:05:15.019711 5de95df2a1fb Verifying Checksum
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=========> ] 20.61MB/111.3MB
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Downloading [==================================================>] 185B/185B
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Verifying Checksum
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Download complete
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=============> ] 28.97MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [================> ] 37.32MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [====================> ] 45.12MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [========================> ] 53.48MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=========================> ] 57.38MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [===========================> ] 61.28MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [==============================> ] 67.96MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=================================> ] 74.65MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [====================================> ] 80.77MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [====================================> ] 81.33MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [=====================================> ] 82.44MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [======================================> ] 85.23MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [========================================> ] 89.69MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [==========================================> ] 93.59MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [============================================> ] 98.04MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [================================================> ] 107.5MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Extracting [==================================================>] 111.3MB/111.3MB
2026-Jun-17 08:05:15.019711 f63c7a8df82b Pull complete
2026-Jun-17 08:05:15.019711 ecbe26720671 Extracting [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:05:15.019711 ecbe26720671 Extracting [==================================================>] 9.619kB/9.619kB
2026-Jun-17 08:05:15.019711 ecbe26720671 Pull complete
2026-Jun-17 08:05:15.019711 ddab922e8d89 Extracting [==================================================>] 129B/129B
2026-Jun-17 08:05:15.019711 ddab922e8d89 Extracting [==================================================>] 129B/129B
2026-Jun-17 08:05:15.019711 ddab922e8d89 Pull complete
2026-Jun-17 08:05:15.019711 95e4c51fed83 Extracting [==================================================>] 170B/170B
2026-Jun-17 08:05:15.019711 95e4c51fed83 Extracting [==================================================>] 170B/170B
2026-Jun-17 08:05:15.019711 95e4c51fed83 Pull complete
2026-Jun-17 08:05:15.019711 5de95df2a1fb Extracting [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:05:15.019711 5de95df2a1fb Extracting [==================================================>] 6.099kB/6.099kB
2026-Jun-17 08:05:15.019711 5de95df2a1fb Pull complete
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Extracting [==================================================>] 185B/185B
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Extracting [==================================================>] 185B/185B
2026-Jun-17 08:05:15.019711 d84bc3f3ded6 Pull complete
2026-Jun-17 08:05:15.019711 db Pulled
2026-Jun-17 08:05:15.019711 Network u3lniscxtfk1klnak223ta5d_wilrop-net Creating
2026-Jun-17 08:05:15.019711 Network u3lniscxtfk1klnak223ta5d_wilrop-net Created
2026-Jun-17 08:05:15.019711 Volume "u3lniscxtfk1klnak223ta5d_wilrop-uploads" Creating
2026-Jun-17 08:05:15.019711 Volume "u3lniscxtfk1klnak223ta5d_wilrop-uploads" Created
2026-Jun-17 08:05:15.019711 Volume "u3lniscxtfk1klnak223ta5d_wilrop-db-data" Creating
2026-Jun-17 08:05:15.019711 Volume "u3lniscxtfk1klnak223ta5d_wilrop-db-data" Created
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Creating
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Created
2026-Jun-17 08:05:15.019711 Container migrate-u3lniscxtfk1klnak223ta5d-080214623259 Creating
2026-Jun-17 08:05:15.019711 Container migrate-u3lniscxtfk1klnak223ta5d-080214623259 Created
2026-Jun-17 08:05:15.019711 Container app-u3lniscxtfk1klnak223ta5d-080214631152 Creating
2026-Jun-17 08:05:15.019711 Container app-u3lniscxtfk1klnak223ta5d-080214631152 Created
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Starting
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Started
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Waiting
2026-Jun-17 08:05:15.019711 Container db-u3lniscxtfk1klnak223ta5d-080214640096 Error
2026-Jun-17 08:05:15.019711 dependency failed to start: container db-u3lniscxtfk1klnak223ta5d-080214640096 is unhealthy
2026-Jun-17 08:05:15.019711 exit status 1
2026-Jun-17 08:05:15.029832 Error type: App\Exceptions\DeploymentException
2026-Jun-17 08:05:15.042315 Error code: 0
2026-Jun-17 08:05:15.053308 Location: /var/www/html/app/Traits/ExecuteRemoteCommand.php:242
2026-Jun-17 08:05:15.065766 Stack trace (first 5 lines):
2026-Jun-17 08:05:15.076957 #0 /var/www/html/app/Traits/ExecuteRemoteCommand.php(106): App\Jobs\ApplicationDeploymentJob->executeCommandWithProcess()
2026-Jun-17 08:05:15.089172 #1 /var/www/html/vendor/laravel/framework/src/Illuminate/Collections/Traits/EnumeratesValues.php(275): App\Jobs\ApplicationDeploymentJob->{closure:App\Traits\ExecuteRemoteCommand::execute_remote_command():72}()
2026-Jun-17 08:05:15.101732 #2 /var/www/html/app/Traits/ExecuteRemoteCommand.php(72): Illuminate\Support\Collection->each()
2026-Jun-17 08:05:15.114144 #3 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(874): App\Jobs\ApplicationDeploymentJob->execute_remote_command()
2026-Jun-17 08:05:15.126929 #4 /var/www/html/app/Jobs/ApplicationDeploymentJob.php(497): App\Jobs\ApplicationDeploymentJob->deploy_docker_compose_buildpack()
2026-Jun-17 08:05:15.139424 ========================================
2026-Jun-17 08:05:15.498487 Gracefully shutting down build container: kod4x4723ke1u73uyybk2agz
2026-Jun-17 08:05:15.772472 [CMD]: docker stop --time=30 kod4x4723ke1u73uyybk2agz
2026-Jun-17 08:05:15.772472 kod4x4723ke1u73uyybk2agz
