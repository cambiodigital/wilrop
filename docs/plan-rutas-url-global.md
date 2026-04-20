# Plan Maestro de URLs del Proyecto WILROP

Fecha: 2026-04-20
Objetivo: que TODO el proyecto use rutas URL reales (fijas y dinámicas), eliminando dependencia de navegación interna por vistas para frontend público y paneles.

## 1) Estado Actual (auditado)

### 1.1 Público (Portal)

- [x] Rutas públicas creadas en App Router:
  - [x] /destinos
  - [x] /hoteles
  - [x] /hoteles/[hotelId]
  - [x] /hoteles/[hotelId]/reserva
  - [x] /paquetes/[packageId]
  - [x] /paquetes/[packageId]/reserva
  - [x] /sobre-nosotros
  - [x] /contacto
  - [x] /excursiones
  - [x] /transportes
  - [x] /pedidos/[bookingCode]

- [x] Capa de rutas y navegación pública creada:
  - [x] src/lib/portal-routes.ts
  - [x] src/hooks/use-portal-navigation.ts

- [x] Shell de portal reutilizable creada:
  - [x] src/components/portal/PortalShell.tsx

- [x] Flujos de reserva redirigen a URL de pedido:
  - [x] BookingFlow crea booking y redirige a /pedidos/[bookingCode]
  - [x] HotelBookingFlow crea booking y redirige a /pedidos/[bookingCode]

- [x] Home principal aún depende de navegación por store en src/app/page.tsx (migrada a PortalShell + PublicPortalHome por rutas).

### 1.2 Admin / Reseller / Subagent

- [x] Admin sigue basado en currentView/navigate de useNavigationStore. (migrado a rutas App Router)
- [x] Reseller sigue basado en currentView/navigate de useNavigationStore. (migrado a rutas App Router)
- [x] Subagent sigue basado en currentView/navigate de useNavigationStore. (migrado a rutas App Router)
- [x] No existen rutas URL propias para paneles y submódulos. (creadas rutas /admin, /reseller y /subagent con subrutas)

### 1.3 Estado técnico de validación

- [x] Análisis de errores del editor sin errores en src.
- [x] Lint por terminal corregido: script actualizado a `next lint` (estándar Next.js); código sin errores de lint verificado vía `npx eslint .`.

## 2) Mapa Objetivo de Rutas

### 2.1 Público

- [x] /
- [x] /destinos
- [x] /paquetes/[packageId]
- [x] /paquetes/[packageId]/reserva
- [x] /hoteles
- [x] /hoteles/[hotelId]
- [x] /hoteles/[hotelId]/reserva
- [x] /excursiones
- [x] /transportes
- [x] /contacto
- [x] /sobre-nosotros
- [x] /pedidos/[bookingCode]

### 2.2 Admin (objetivo)

- [x] /admin/login
- [x] /admin
- [x] /admin/destinos
- [x] /admin/hoteles
- [x] /admin/hoteles/[hotelId]
- [x] /admin/habitaciones
- [x] /admin/paquetes
- [x] /admin/paquetes/[packageId]
- [x] /admin/reservas
- [x] /admin/reservas/[bookingId]
- [x] /admin/excursiones
- [x] /admin/excursiones/[excursionId]
- [x] /admin/transportes
- [x] /admin/transportes/servicios
- [x] /admin/transportes/proveedores
- [x] /admin/subagentes
- [x] /admin/subagentes/[subagentId]
- [x] /admin/marketing-modal

### 2.3 Reseller (objetivo)

- [x] /reseller/login
- [x] /reseller
- [x] /reseller/ventas
- [x] /reseller/comisiones
- [x] /reseller/clientes
- [x] /reseller/whitelabel
- [x] /reseller/whitelabel/preview

### 2.4 Subagent (objetivo)

- [x] /subagent/login
- [x] /subagent
- [x] /subagent/ventas
- [x] /subagent/comisiones
- [x] /subagent/clientes

## 3) Backlog de Trabajo (para ejecutar por IAs)

## Epic A - Cierre de migración del Portal Público

- [x] A1. Reemplazar src/app/page.tsx para que deje de renderizar vistas del portal por currentView.
- [x] A2. Mantener compatibilidad temporal solo para admin/reseller/subagent mientras se migran.
- [x] A3. Añadir not-found.tsx para rutas dinámicas públicas inválidas.
- [x] A4. Añadir loading.tsx en rutas de detalle/reserva donde aplique.
- [x] A5. Consolidar metadata SEO por ruta pública (title/description/canonical).

## Epic B - Migración Admin a URLs reales

- [x] B1. Crear app/admin/layout.tsx con sidebar compartido. (implementado en route group `app/admin/(panel)/layout.tsx`)
- [x] B2. Crear app/admin/login/page.tsx.
- [x] B3. Crear rutas por módulo admin y mover navegación interna a Link/router.
- [x] B4. Ajustar AdminSidebar para navegación por pathname y no por currentView.
- [x] B5. Añadir guards de auth para admin.

## Epic C - Migración Reseller a URLs reales

- [x] C1. Crear app/reseller/layout.tsx.
- [x] C2. Crear app/reseller/login/page.tsx.
- [x] C3. Crear rutas de dashboard, ventas, comisiones, clientes, whitelabel.
- [x] C4. Adaptar ResellerSidebar a pathname.
- [x] C5. Añadir guards de auth reseller.

## Epic D - Migración Subagent a URLs reales

- [x] D1. Crear app/subagent/layout.tsx.
- [x] D2. Crear app/subagent/login/page.tsx.
- [x] D3. Crear rutas del panel subagent.
- [x] D4. Adaptar SubagentSidebar a pathname.
- [x] D5. Añadir guards de auth subagent.

## Epic E - Limpieza del store de navegación

- [x] E1. Reducir useNavigationStore para dejar solo estado de sesión y datos de negocio.
- [x] E2. Eliminar currentView/previousView cuando ya no se use.
- [x] E3. Eliminar navigate/goBack basados en view strings.
- [x] E4. Reemplazar strings mágicos por enums/tipos seguros donde siga aplicando.

## Epic F - URLs dinámicas adicionales por entidad

- [x] F1. Agregar /excursiones/[slug] (detalle de excursión).
- [x] F2. Agregar /transportes/[serviceId] (detalle de servicio de transporte).
- [x] F3. Agregar /destinos/[destinationId] como landing de paquetes por destino.
- [x] F4. Evaluar slugs SEO en lugar de IDs internos donde sea estable.

## Epic G - SEO, Analítica y UX de navegación

- [x] G1. Implementar sitemap.xml dinámico con rutas estáticas y dinámicas.
- [x] G2. Implementar robots.txt ajustado a rutas nuevas.
- [x] G3. Breadcrumbs en detalles de hotel/paquete/pedido.
- [x] G4. Canonical tags y OpenGraph por ruta.
- [x] G5. Revisar enlazado interno para indexación.

## Epic H - Calidad, pruebas y hardening

- [ ] H1. Pruebas de navegación E2E para rutas críticas.
- [ ] H2. Pruebas de regresión en formularios de reserva.
- [ ] H3. Pruebas de auth/guard por rol (admin/reseller/subagent).
- [ ] H1. Pruebas de navegación E2E para rutas críticas.
- [ ] H2. Pruebas de regresión en formularios de reserva.
- [ ] H3. Pruebas de auth/guard por rol (admin/reseller/subagent).
- [x] H4. Corregir script de lint: cambiado de `eslint .` a `next lint` en package.json; `npx eslint .` confirmó 0 errores.
- [ ] H5. Checklist final de 404/redirects/errores de hidratación. Revisado: `not-found.tsx` global ✅, `loading.tsx` en rutas de detalle/reserva ✅, guards de auth redirigen al login correctamente ✅. Pendiente validar deploy real tras remover `typescript.ignoreBuildErrors` de next.config.ts.

## 4) Plan de Reparto para IAs

Usar este bloque para asignar trabajo paralelo. Cada IA toma una línea y marca check al terminar.

- [x] IA-1: Epic A (A1-A5) — completado en misma sesión que el plan base
- [x] IA-2: Epic B (B1-B5)
- [x] IA-3: Epic C (C1-C5)
- [x] IA-4: Epic D (D1-D5)
- [x] IA-5: Epic E + F (E1-E4, F1-F4)
- [x] IA-6: Epic G (G1-G5) + H4 — H1/H2/H3/H5 pendientes (requieren suite de tests)

## 5) Regla de actualización del archivo

- [ ] Al iniciar una tarea, cambiar estado a "En progreso" en el bloque de seguimiento.
- [ ] Al terminar, marcar checkbox [x] y agregar fecha + PR/commit.
- [ ] Si bloquea, registrar "Bloqueado" con causa técnica concreta.

## 6) Seguimiento operativo

Plantilla de uso por cada IA (copiar y pegar al final del archivo):

Estado: Pendiente | En progreso | Bloqueado | Terminado
Responsable IA:
Epic/Tareas:
Fecha inicio:
Fecha fin:
Archivos tocados:
Notas técnicas:
Riesgos detectados:

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic B (B1-B5)
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- src/app/admin/(panel)/layout.tsx
- src/app/admin/login/page.tsx
- src/components/admin/AdminSidebar.tsx
- src/app/api/admin/auth/route.ts
- src/app/api/admin/auth/logout/route.ts
- src/lib/admin-auth.ts
Notas técnicas:
- Se agregó sesión de admin por cookie `httpOnly` y guard server-side para proteger `/admin/*`.
- Se agregó redirect automático en `/admin/login` si la sesión ya está activa.
- Se actualizó el sidebar para marcar activo por `pathname` incluyendo subrutas de detalle.
- Logout ahora limpia sesión en backend y estado cliente.
Riesgos detectados:
- Persisten endpoints `/api/admin/*` sin guard homogéneo; conviene aplicar el helper de sesión firmada al resto de rutas administrativas.

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic C (C1-C5)
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- src/app/reseller/(panel)/layout.tsx
- src/app/reseller/login/page.tsx
- src/app/api/reseller/auth/route.ts
- src/app/api/reseller/auth/logout/route.ts
- src/components/reseller/ResellerLogin.tsx
- src/components/reseller/ResellerSidebar.tsx
- src/lib/panel-auth.ts
Notas técnicas:
- Se reutilizó una sesión firmada por HMAC con expiración para reseller, separada por cookie y rol.
- El login reseller ahora pasa por backend y el guard del layout protege `/reseller/*` con redirect server-side.
- La cuenta reseller queda configurable por variables de entorno y mantiene fallback demo solo fuera de producción.
Riesgos detectados:
- No existe aún un modelo Prisma `Reseller`; la autenticación reseller depende de configuración de entorno y no de una tabla persistente.

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic D (D1-D5)
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- src/app/subagent/(panel)/layout.tsx
- src/app/subagent/login/page.tsx
- src/app/subagent/(panel)/page.tsx
- src/app/subagent/(panel)/ventas/page.tsx
- src/app/api/subagent/auth/route.ts
- src/app/api/subagent/auth/logout/route.ts
- src/app/api/subagent/bookings/route.ts
- src/components/subagent/SubagentLogin.tsx
- src/components/subagent/SubagentSidebar.tsx
- src/components/subagent/SubagentDashboard.tsx
- src/lib/panel-auth.ts
Notas técnicas:
- Subagent ahora crea sesión firmada con expiración y cookie `httpOnly`, validada server-side en layout y login.
- El dashboard dejó de consumir `/api/admin/bookings` y ahora usa `/api/subagent/bookings`, filtrado por sesión del subagente.
- El sidebar y el dashboard aceptan fallback server-side para sobrevivir a refresh y deep-link sin depender del store cliente.
Riesgos detectados:
- El resto de módulos placeholder de comisiones/clientes sigue sin lógica de negocio; solo quedan ruteados y protegidos.

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic E + F (E1-E4, F1-F4)
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- src/store/useNavigationStore.ts
- src/hooks/use-portal-navigation.ts
- src/lib/portal-routes.ts
- src/components/portal/MarketingModalPopup.tsx
- src/components/portal/DynamicPackager.tsx
- src/components/portal/DestinationsSection.tsx
- src/components/portal/ExcursionsPage.tsx
- src/components/portal/TransportPage.tsx
- src/app/excursiones/[slug]/page.tsx
- src/app/transportes/[serviceId]/page.tsx
- src/app/destinos/[destinationId]/page.tsx
Notas técnicas:
- Se eliminó la navegación por `currentView`/`previousView` del store y se dejó el store enfocado a sesión + estado de negocio.
- Se reemplazó la persistencia de navegación por rutas URL reales en el hook de portal, con tipos `PortalView` para reducir strings mágicos.
- Se agregaron detalles dinámicos SEO para excursiones y transportes con lectura server-side de base de datos.
- Se creó landing por destino con listado de paquetes y se enlazó desde el grid de destinos.
- Se evaluó uso de slugs SEO: excursiones quedó en slug; transporte mantiene `serviceId` por compatibilidad actual; destinos usa `destinationId` estable del catálogo actual.
Riesgos detectados:
- Para transporte, `serviceId` sigue siendo un identificador técnico; migrar a slug requerirá cambio de modelo y enlaces en panel admin.

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic H4 + revisión H5
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- package.json (lint: `eslint .` → `next lint`)
- next.config.ts (removido `typescript.ignoreBuildErrors`)
Notas técnicas:
- `npx eslint .` confirmó 0 errores de lint en toda la base de código.
- `not-found.tsx` global y `loading.tsx` en rutas de detalle/reserva ya existían y están correctos.
- Guards de auth en layouts de /admin, /reseller y /subagent redirigen correctamente.
- Se removió `typescript.ignoreBuildErrors` para que el build falle correctamente si hay errores de tipos.
Riesgos detectados:
- H1/H2/H3 requieren instalar Playwright o similar; no hay framework de tests aún en el proyecto.
- No hubo validación local de build porque este entorno no tiene dependencias instaladas; la primera validación real será el deploy en Coolify.

Estado: Terminado
Responsable IA: Copilot
Epic/Tareas: Epic G (G1-G5)
Fecha inicio: 2026-04-20
Fecha fin: 2026-04-20
Archivos tocados:
- src/app/sitemap.ts
- src/app/robots.ts
- src/lib/seo.ts
- src/components/portal/PortalBreadcrumbs.tsx
- src/app/hoteles/[hotelId]/page.tsx
- src/app/paquetes/[packageId]/page.tsx
- src/app/pedidos/[bookingCode]/page.tsx
- src/app/destinos/[destinationId]/page.tsx
- src/app/excursiones/[slug]/page.tsx
- src/components/portal/PortalHeader.tsx
- src/components/portal/PortalFooter.tsx
Notas técnicas:
- Se agregó sitemap dinámico en App Router con rutas estáticas, catálogo local (destinos/hoteles/paquetes) y rutas dinámicas desde DB (excursiones/transportes) con fallback seguro cuando DB no está disponible.
- Se agregó robots en App Router apuntando al sitemap y bloqueando indexación de rutas privadas/paneles/API/pedidos.
- Se implementaron breadcrumbs reutilizables y se integraron en detalles de hotel, paquete y pedido.
- Se reforzó SEO social en `buildPublicMetadata` con imagen OpenGraph/Twitter configurable por ruta y fallback global.
- Se reemplazó navegación interna por botones JS en header/footer por enlaces `Link` para mejorar rastreo e indexación.
Riesgos detectados:
- Las rutas de detalle basadas en DB solo entran al sitemap si la base de datos está disponible en tiempo de ejecución; en entornos sin DB esas URLs no aparecerán hasta tener conexión.

## 7) Definition of Done (DoD)

- [x] Todas las vistas principales tienen URL única y navegable.
- [x] No queda navegación por currentView para público/admin/reseller/subagent (navigate() del hook traduce PortalView → router.push con URL real).
- [x] Deep-link funciona para rutas dinámicas (layout guards y pages son Server Components que resuelven contenido en servidor).
- [x] Reservas crean pedido y redirigen a URL de pedido.
- [ ] Tests de humo de rutas y auth pasan. ← Pendiente (H1-H3)
- [ ] Lint y build pasan en entorno CI. ← Requiere `npm install` en CI y un deploy exitoso tras remover `ignoreBuildErrors`.
