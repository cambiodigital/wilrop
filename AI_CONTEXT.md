# AI Context

## 2026-05-18
- **Módulo Reseller - Fase 7 (Clientes) completada:** CRUD completo de clientes con API real conectada al modelo `ResellerClient` de Prisma.
  - **Server actions:** `src/lib/reseller/clients.ts` con `getResellerClients`, `getResellerClient`, `createResellerClient`, `updateResellerClient`, `deleteResellerClient`.
  - **Validadores:** `src/lib/reseller/clients-validators.ts` con zod (clientSchema, updateClientSchema, clientFiltersSchema).
  - **API routes:** `/api/reseller/clients` (GET/POST) y `/api/reseller/clients/[id]` (GET/PATCH/DELETE) con autenticación de sesión reseller.
  - **Componentes extraídos:** `ResellerClientList.tsx` (tabla con búsqueda, paginación, badges de estado), `ResellerClientForm.tsx` (crear/editar con validación), `ResellerClientDetail.tsx` (detalle con info completa y confirmación de eliminación).
  - **Componente principal:** `ResellerClients.tsx` refactorizado para usar datos reales de la API en lugar de mock data.
  - **Modelo ResellerClient:** campos `name`, `email`, `phone`, `country`, `passport`, `notes`, `totalPurchases`, `totalSpent`, `createdAt`, `updatedAt`.
  - **Estado dinámico:** badges "Nuevo"/"Activo"/"Inactivo" calculados según `totalPurchases` y días desde última actualización.

## 2026-05-17
- **Panel Admin - Diseño de color y jerarquía visual:** Se implementó un sistema de diseño completo en el scope `.admin-theme` de `globals.css`:
  - **Tokens** nuevos: `--admin-table-header-bg`, `--admin-table-stripe-bg`, `--admin-table-hover-bg`, `--admin-input-error*`, `--admin-shadow-*`.
  - **Jerarquía:** Clases utilitarias: `.page-header` (títulos con peso 800, color foreground), `.form-section-title` (subtítulos en formularios), `.dialog-footer` (borde + espaciado consistente), `.label-required` (asterisco rojo automático en labels), `.label-muted` (labels secundarios), `.badge-featured` (badge dorado), `.field-error-text` (texto de error), `.input-error` (input con borde/fondo rojo).
  - **Tablas:** Headers con fondo `#f0f4f8` + uppercase + tracking, filas alternas `#fafcfd`, hover `#e8f2ff`.
  - **Diálogos:** Shadow `0 10px 30px rgba(0,0,0,.12)`, título 700 weight, botón primario con `font-weight: 600`.
  - **Tabs:** Pestaña activa con fondo blanco + shadow, inactiva gris con hover.
  - **Inputs/Selects:** Focus ring dorado con box-shadow expandido, hover gris claro, estados de error visuales.
  - **Botones:** `outline` (Cancel) con fondo blanco + texto muted, hover gris; primario con peso 600.
  - **Componentes actualizados:** Todos los admin components (`AdminHotels`, `AdminPackages`, `AdminDestinations`, `AdminExcursions`, `AdminTransport`, `AdminAllotments`, `AdminSubagents`, `AdminBookings`, `AdminDashboard`, `AdminMarketingModal`) ahora usan `page-header`, `dialog-footer`, `label-required`, `label-muted`, `form-section-title` y `space-y-1.5` en forms.
  - Las variables de diseño originales (`--brand-*`) se respetan; solo se añaden refinamientos para el contexto admin.

## 2026-05-06
- La sección `WhyUsSection` mantiene dos bloques: equipo (fotos con `name`/`role`) y tarjetas de beneficios comerciales.
- Los textos visibles de cada foto (`name`, `role`, `alt`) se centralizan en `src/lib/team.ts` para mantener una sola fuente de verdad.
- Autenticación de panel (admin/subagent/reseller): passwords se verifican con bcrypt cuando están hasheados y se soporta compatibilidad legacy; al iniciar sesión con password legacy se actualiza automáticamente a bcrypt.
- Docker: `docker-entrypoint.sh` soporta modos `all|migrate|web`; en `docker-compose` las migraciones/bootstrap admin corren en el servicio `migrate` y la app arranca en modo `web`.
- Docker: el `Dockerfile` define `CMD ["web"]` para que, si la plataforma no pasa argumentos, el contenedor arranque por defecto en modo `web` (evita ejecutar migraciones en cada restart).

## 2026-05-15
- Catálogos (destinos/hoteles/paquetes/excursiones/transporte): se agrega `isTemplate` con fallback (si existen registros reales, no se devuelven plantillas).
- Migración Prisma: `bun run db:migrate` (dev) / `prisma migrate deploy` (prod) y `bun run db:generate`.
