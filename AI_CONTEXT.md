# AI Context

## 2026-05-06
- La sección `WhyUsSection` mantiene dos bloques: equipo (fotos con `name`/`role`) y tarjetas de beneficios comerciales.
- Los textos visibles de cada foto (`name`, `role`, `alt`) se centralizan en `src/lib/team.ts` para mantener una sola fuente de verdad.
- Autenticación de panel (admin/subagent/reseller): passwords se verifican con bcrypt cuando están hasheados y se soporta compatibilidad legacy; al iniciar sesión con password legacy se actualiza automáticamente a bcrypt.
- Docker: `docker-entrypoint.sh` soporta modos `all|migrate|web`; en `docker-compose` las migraciones/bootstrap admin corren en el servicio `migrate` y la app arranca en modo `web`.
- Docker: el `Dockerfile` define `CMD ["web"]` para que, si la plataforma no pasa argumentos, el contenedor arranque por defecto en modo `web` (evita ejecutar migraciones en cada restart).

## 2026-05-15
- Catálogos (destinos/hoteles/paquetes/excursiones/transporte): se agrega `isTemplate` con fallback (si existen registros reales, no se devuelven plantillas).
- Migración Prisma: `bun run db:migrate` (dev) / `prisma migrate deploy` (prod) y `bun run db:generate`.
