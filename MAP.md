# Project Map

**Purpose:** High-level overview of the architecture, main modules, and code navigation points for the WILROP travel agency platform — a multi-tenant Next.js 16 application with role-based dashboards, white-label reseller domains, and a public B2C travel portal.

---

## Notes for AI Agents

- **Entry points:**
  - `src/app/layout.tsx` — root layout (providers, fonts, i18n)
  - `src/app/page.tsx` — public landing page
  - `middleware.ts` — domain resolution (custom domains/subdomains) and role-based auth guard
  - `src/lib/db.ts` — Prisma client singleton
  - `src/lib/panel-auth-edge.ts` — edge-compatible session verification used by middleware
  - `next.config.ts` — standalone output, cache headers
  - `docker-compose.yml` — production deployment with migrate/app/db services

- **Main patterns:**
  - **App Router + Server Components:** Pages under `src/app/` are thin assemblers; business logic lives in `src/lib/` and UI lives in `src/components/`.
  - **All server access goes through `src/lib/db.ts`** — never import Prisma client directly elsewhere.
  - **Session-based auth per role:** admin, reseller, subagent each have their own cookie and login flow (`next-auth` only used for public B2C).
  - **Catalog spine:** `Destination` is the central entity; hotels, packages, excursions, transport, and cruises connect via join tables (`DestinationHotel`, `DestinationPackage`, etc.).
  - **Template/real duality:** All catalog entities have `isTemplate` with fallback logic — if real records exist for a reseller/context, templates are not returned.
  - **CSS convention:** Tailwind v4 with CSS variables in `globals.css` (`@theme inline`). No raw hex colors in JSX. Utility classes like `.page-header`, `.dialog-footer`, `.label-required` in `globals.css`.

- **General rule:** Read `RESTRUCTURING_RULES.md` and this file before proposing structural changes. Respect the separation: pages (thin), `src/lib` (logic), `src/components` (UI), `src/hooks` (client state).

---

## 1. Public B2C Portal

The customer-facing travel website at the main domain (`wilrop.com.co`). Displays destinations, hotels, packages, excursions, cruises, and transport with booking flows.

```text
src/app/
  page.tsx                     → Public landing (thin wrapper)
  layout.tsx                   → Root layout (providers, fonts, i18n)
  destinos/
  hoteles/
  paquetes/
  excursiones/
  cruceros/
  transportes/
  pedidos/
  contacto/
  sobre-nosotros/
src/components/portal/         → Public-facing UI components
  PublicPortalHome.tsx
  PortalShell.tsx, PortalHeader.tsx, PortalFooter.tsx
  HeroSection.tsx, ExploreSection.tsx, DestinationsSection.tsx
  HotelDetailPage.tsx, HotelBookingFlow.tsx
  PackageDetail.tsx, DynamicPackager.tsx, PackageBuilderCards.tsx
  CruiseDetailPage.tsx, CruiseBookingFlow.tsx
  BookingFlow.tsx, MarketingModalPopup.tsx
src/app/api/public/            → Public REST API endpoints
  destinations/, hotels/, packages/, excursions/, cruises/
  transport/, booking/, stats/, reseller-resolve/, help-articles/
src/data/                      → CSV/static seed data
  destinations.ts, hotels.ts, packages.ts, cruises.ts
```

**Main responsibilities:**

- Browse and search travel catalog by destination
- View detail pages for every catalog entity
- Multi-step booking flow (hotel, package, cruise)
- Contact form, about page, social proof sections

**Key files:**

- `src/components/portal/PublicPortalHome.tsx` — main landing page composition
- `src/components/portal/HotelDetailPage.tsx` — complex entity detail with booking
- `src/components/portal/PackageDetail.tsx` — itinerary, room types, dates, pricing
- `src/app/api/public/` — public API routes proxying catalog data

**Relationships:**

- Depends on `src/lib/catalog/` for catalog queries and hydration
- Depends on `src/lib/contact.ts` for contact form
- Depends on `src/lib/currency.ts`, `src/lib/date.ts`, `src/lib/json.ts` for formatting
- Shares UI primitives from `src/components/ui/` (Shadcn)

---

## 2. Catalog Engine

Core business logic for the tourism catalog: destinations, hotels, packages, excursions, transport services, and cruises — including their relational spine, template fallback, pricing, and public hydration.

```text
src/lib/catalog/
  index.ts                     → Barrel re-export
  types.ts                     → TypeScript interfaces (BaseEntity, CatalogEntry, etc.)
  matching.ts                  → Slug/ID matching logic
  packages.ts                  → Package queries and composition
  destinations.ts              → Destination queries with joins
  backfill.ts                  → Template fallback (isTemplate logic)
  public-hydration.ts          → Public-facing data formatting
src/lib/admin/                 → Admin-side catalog utilities
  hotels.ts, package-relations.ts, package-relation-ui.ts
  hotel-roomtypes.ts, hotel-destination-ui.ts
  excursion-destination-ui.ts, transport-destination-ui.ts
  relation-options.ts, package-relation-ui.ts, resellers.ts
src/lib/package-pricing.ts     → Package price calculation
src/lib/extras-pricing.ts      → Add-on/extras pricing
src/app/api/admin/             → 19 admin API endpoint groups for full CRUD
  allotments/, bookings/, cruises/, destinations/, excursions/
  hotels/, packages/, rooms/, transport-providers/, transport-services/
  resellers/, subagents/, stats/, upload/, uploads/
  help-articles/, marketing-modal/, relation-options/
```

**Main responsibilities:**

- Query and compose catalog entities with relational joins
- Template fallback: return real data when available, templates otherwise
- Public hydration: format raw DB rows for the public portal
- Admin CRUD via REST API under `src/app/api/admin/`

**Key files:**

- `src/lib/catalog/types.ts` — all catalog TypeScript interfaces
- `src/lib/catalog/backfill.ts` — template/real entity resolution
- `src/lib/catalog/public-hydration.ts` — formatting for public consumption
- `src/lib/catalog/destinations.ts` — destination queries with hotel/package counts
- `tests/catalog-pr2.test.cjs` — catalog matching and backfill tests

**Relationships:**

- Depends on `src/lib/db.ts` (Prisma client)
- Used by both public portal and admin panel
- Seeds from `src/data/` CSV files

---

## 3. Admin Panel

Protected dashboard at `/admin` for platform operators. Full CRUD management of all catalog entities, resellers, subagents, bookings, documentation, and marketing modals.

```text
src/app/admin/
  login/                       → Admin login page
  (panel)/
    layout.tsx                 → Panel shell with sidebar
    page.tsx                   → Dashboard
    destinos/, hoteles/, paquetes/, excursiones/
    cruceros/, transportes/, habitaciones/
    reservas/, resellers/, revendedores/, subagentes/
    paquetes-personalizados/, marketing-modal/, documentacion/
src/components/admin/
  AdminSidebar.tsx
  AdminDashboard.tsx, AdminLogin.tsx
  AdminDestinations.tsx, AdminHotels.tsx, AdminPackages.tsx
  AdminExcursions.tsx, AdminCruises.tsx, AdminTransport.tsx
  AdminAllotments.tsx, AdminBookings.tsx, AdminSubagents.tsx
  AdminResellers.tsx, AdminMarketingModal.tsx
  AdminEntityDialog.tsx, AdminDocumentation.tsx
  HotelImageUpload.tsx, ImageGallery.tsx
src/lib/admin-auth.ts          → Admin session verification (server-side)
src/lib/panel-auth.ts          → Shared panel auth utilities
src/lib/panel-auth-edge.ts     → Edge-compatible auth for middleware
src/app/api/marketing-modal/   → Marketing modal public API
```

**Main responsibilities:**

- Full CRUD for all catalog entities and their relationships
- Reseller management (approval, rejection, commission, documents)
- Subagent management
- Booking management
- Marketing modal configuration
- Help articles / documentation CMS

**Key files:**

- `middleware.ts` — protects `/admin` routes, redirects to login
- `src/lib/admin-auth.ts` — server-side session verification
- `src/components/admin/AdminSidebar.tsx` — navigation structure
- `src/components/admin/AdminEntityDialog.tsx` — reusable entity create/edit dialog

**Relationships:**

- Depends on `src/lib/admin/` for catalog operations
- Depends on `src/lib/catalog/` for entity queries
- Uses `src/components/ui/` for all UI primitives

---

## 4. Reseller Panel

Protected dashboard at `/reseller` for approved resellers. Product catalog browsing, own products, client management, sales tracking, commissions, documentation upload, and white-label configuration.

```text
src/app/reseller/
  login/, register/
  (panel)/
    layout.tsx                 → Panel shell with sidebar
    page.tsx                   → Dashboard
    catalog/, productos/, clientes/
    ventas/, comisiones/, documentacion/
    profile/, settings/, whitelabel/
src/components/reseller/
  ResellerSidebar.tsx, ResellerDashboard.tsx
  ResellerCatalogBrowser.tsx, ResellerCatalogItem.tsx
  ResellerCatalogFilters.tsx, ResellerAddToCatalogDialog.tsx
  ResellerPriceEditor.tsx
  ResellerClients.tsx, ResellerClientList.tsx, ResellerClientForm.tsx
  ResellerClientDetail.tsx
  ResellerSales.tsx, ResellerSaleList.tsx, ResellerSaleForm.tsx
  ResellerCommissions.tsx, ResellerCommissionSummary.tsx
  ResellerProfile.tsx, ResellerProfileForm.tsx
  ResellerDocumentation.tsx, ResellerDocumentUpload.tsx
  ResellerWhiteLabelConfig.tsx
  ResellerOwnHotels.tsx, ResellerOwnExcursions.tsx, ResellerOwnPackages.tsx
  ResellerOwnTransport.tsx, ResellerOwnCruises.tsx
src/lib/reseller/
  catalog.ts, catalog-validators.ts
  clients.ts, clients-validators.ts
  sales.ts, sales-validators.ts
  commissions.ts, dashboard.ts, profile.ts
  source-resolver.ts, validators.ts
src/app/api/reseller/
  auth/, catalog/, products/, clients/
  sales/, commissions/, dashboard/, profile/
  register/, whitelabel/
src/lib/reseller-auth.ts       → Reseller session verification
src/lib/reseller-access.ts     → Reseller permission checks
```

**Main responsibilities:**

- Browse global catalog and add items to own catalog with custom pricing
- Manage own clients (CRUD)
- Record sales against bookings or standalone
- View commission history and earnings
- Upload verification documents
- Configure white-label branding, custom domain, subdomain

**Key files:**

- `src/lib/reseller/catalog.ts` — reseller catalog logic (source resolution, pricing)
- `src/lib/reseller/clients.ts` — reseller client CRUD server actions
- `src/lib/reseller/sales.ts` — sales and commission tracking
- `src/lib/reseller-auth.ts` — session verification
- `src/lib/reseller/source-resolver.ts` — resolve source items (template-origin)

**Relationships:**

- Depends on `src/lib/catalog/` for underlying catalog data
- Depends on `src/lib/panel-auth.ts` and `src/lib/panel-auth-edge.ts` for auth
- Catalog items reference global entities via `ResellerCatalog` join table
- White-label config stored as JSON in `Reseller.whiteLabelConfig`

---

## 5. Subagent Panel

Protected dashboard at `/subagent` for subagents (resellers' own agents). Simplified view with client management, sales, and commissions.

```text
src/app/subagent/
  login/
  (panel)/
    layout.tsx, page.tsx
    clientes/, ventas/, comisiones/
src/components/subagent/
  SubagentLogin.tsx, SubagentSidebar.tsx, SubagentDashboard.tsx
src/app/api/subagent/
  auth/, bookings/
```

**Main responsibilities:**

- Client management for subagent's own customers
- Sales recording
- Commission tracking
- Booking management

**Key files:**

- `src/components/subagent/SubagentSidebar.tsx` — navigation
- `src/app/api/subagent/auth/` — subagent authentication API

**Relationships:**

- Subagents belong to resellers (no independent catalog)
- Uses same auth patterns as admin/reseller panels
- References bookings and sales via `subagentId` fields

---

## 6. White-Label / Brand System

Multi-tenant white-label system allowing resellers to serve their own branded site via subdomains or custom domains.

```text
src/app/brand/
  page.tsx                     → Brand landing (rewrite target from middleware)
src/components/brand/
  BrandLanding.tsx             → White-label public site
  BrandWordmark.tsx            → Reseller logo/name display
src/components/whitelabel/
  WhiteLabelCreator.tsx        → Admin tool to create white-label configs
  WhiteLabelPreview.tsx        → Preview of white-label appearance
src/store/useWhiteLabelStore.ts → Zustand store for brand CSS vars and config
src/lib/brand.ts               → Brand/white-label server utilities
Caddyfile                      → Reverse proxy with on-demand TLS for custom domains
```

**Main responsibilities:**

- Resolve reseller by subdomain (`travelagency.wilropgroup.com`) or custom domain (`travel.example.com`)
- Serve fully branded site using reseller's logo, colors, company name
- On-demand TLS certificate issuance for custom domains via Caddy
- White-label config stored as JSON on `Reseller` model

**Key files:**

- `middleware.ts` — detects non-main-domain requests, resolves to `/brand` route with subdomain/domain params
- `src/app/brand/page.tsx` — rewrites target, loads reseller by subdomain/domain
- `src/app/api/public/reseller-resolve/` — domain validation endpoint for Caddy TLS
- `Caddyfile` — on-demand TLS with `ask` endpoint
- `src/store/useWhiteLabelStore.ts` — client-side white-label state

**Relationships:**

- Middleware rewrites to `src/app/brand/`, which reuses public portal components
- Domain validation: `middleware.ts` → `Caddyfile as URL` → `src/app/api/public/reseller-resolve/`

---

## 7. Middleware & Authentication

Edge-level middleware for domain resolution and role-based route protection. Dual auth system: custom session tokens for panels (admin/reseller/subagent) and NextAuth for public B2C.

```text
middleware.ts                  → Domain rewrite + role-based auth guard
src/lib/panel-auth-edge.ts     → Edge-compatible session verify
src/lib/panel-auth.ts          → Server-side panel auth (bcrypt, session tokens)
src/lib/admin-auth.ts          → Admin-specific auth helpers
src/lib/reseller-auth.ts       → Reseller-specific auth helpers
src/lib/password.mjs           → Password hashing (bcrypt) with legacy fallback
src/lib/secure-compare.mjs     → Timing-safe string comparison
src/lib/reseller-access.ts     → Reseller permission/approval checks
src/lib/portal-routes.ts       → Public portal route definitions
```

**Main responsibilities:**

- Detect main domain vs. subdomain/custom domain in middleware
- Route protection: redirect unauthenticated users to role-specific login pages
- Session token generation, cookie management, bcrypt password verification
- Legacy password hash migration (automatic upgrade to bcrypt on login)

**Key files:**

- `middleware.ts` — the central routing and auth guard (every request goes through this)
- `src/lib/panel-auth-edge.ts` — must be edge-compatible (no Node.js APIs)
- `src/lib/panel-auth.ts` — server-side session CRUD against DB
- `src/lib/password.mjs` — bcrypt with legacy SHA fallback + auto-upgrade

**Relationships:**

- Middleware depends on `panel-auth-edge.ts` (edge-safe)
- Server-side routes depend on `panel-auth.ts`, `admin-auth.ts`, `reseller-auth.ts`
- All panel API routes check auth on each request

---

## 8. Database (Prisma + PostgreSQL)

Prisma ORM schema, migrations, Docker setup, and database utilities.

```text
prisma/
  schema.prisma                 → Full DB schema (785 lines, 30+ models)
  migrations/                   → Prisma migration history
  seed.ts                       → Database seeder
db/
  custom.db                     → Standalone/sqlite fallback (development)
docker-compose.yml              → PostgreSQL 16, migration job, app service
Dockerfile                      → Multi-stage Next.js + Prisma production build
docker-entrypoint.sh            → Container entrypoint (all|migrate|web modes)
check-db.ts                     → Database health check script
src/lib/db.ts                   → Prisma client singleton
```

**Main responsibilities:**

- Define all data models (Admin, Reseller, Subagent, Destination, Hotel, TravelPackage, Excursion, Cruise, TransportService, Booking, etc.)
- Relational spine: join tables connecting destinations to hotels/packages/excursions/transport/cruises
- Migrations: `bun run db:migrate` (dev), `prisma migrate deploy` (prod)

**Key files:**

- `prisma/schema.prisma` — single source of truth for all data models
- `src/lib/db.ts` — Prisma client singleton (import this, never `@prisma/client` directly)
- `docker-compose.yml` — migration-then-app orchestration pattern
- `Dockerfile` — standalone output with Prisma binary target

**Relationships:**

- Used by every `src/lib/` module and API route
- Reseller catalog stored as `ResellerCatalog` join table (not a separate DB)
- White-label config as JSON column on `Reseller`

---

## 9. UI Components (Shadcn + Tailwind)

Reusable UI primitives built on Radix UI + Tailwind v4, plus domain-specific components for each role.

```text
src/components/ui/              → 49 Shadcn UI components
  button.tsx, input.tsx, select.tsx, dialog.tsx
  table.tsx, form.tsx, sidebar.tsx, card.tsx
  tabs.tsx, dropdown-menu.tsx, popover.tsx, sheet.tsx
  calendar.tsx, chart.tsx, carousel.tsx, skeleton.tsx
  ... (full Shadcn suite)
src/components/portal/          → Public B2C travel UI (33 components)
src/components/admin/           → Admin panel UI (21 components)
src/components/reseller/        → Reseller panel UI (35 components)
src/components/subagent/        → Subagent panel UI (3 components)
src/components/brand/           → White-label brand UI (2 components)
src/components/whitelabel/      → White-label config UI (2 components)
src/hooks/                      → Custom React hooks (9 hooks)
  use-cities.ts, use-image-upload.ts, use-mobile.ts
  use-package-excursion.ts, use-package-hotel.ts, use-package-transport.ts
  use-portal-navigation.ts, use-reseller-context.ts, use-toast.ts
src/store/                      → Zustand stores (2 stores)
  useNavigationStore.ts, useWhiteLabelStore.ts
tailwind.config.ts              → Tailwind v4 configuration
src/app/globals.css             → CSS variables, theme tokens, utility classes
components.json                 → Shadcn configuration
```

**Main responsibilities:**

- Provide consistent UI primitives across all panels and public portal
- Enforce design system (`RESTRUCTURING_RULES.md`): no raw hex colors, use Tailwind classes and CSS variables

**Key files:**

- `src/app/globals.css` — `@theme inline` CSS variables + `.admin-theme` scope + utility classes (`.page-header`, `.dialog-footer`, etc.)
- `components.json` — Shadcn configuration (base color, aliases)
- `src/hooks/use-reseller-context.ts` — reseller context provider hook

**Relationships:**

- All role-specific components depend on `src/components/ui/`
- Hooks are used by portal and panel components
- `useWhiteLabelStore` consumed by brand pages

---

## 10. Deployment & Infrastructure

Docker-based production deployment with three services, reverse proxy with automatic TLS.

```text
docker-compose.yml              → 3-service orchestration (migrate, app, db)
Dockerfile                      → Multi-stage build (bun, next, prisma)
docker-entrypoint.sh            → Container mode dispatcher
Caddyfile                       → Reverse proxy with on-demand TLS
.zscripts/                      → Shell scripts for dev/build/start
  build.sh, dev.sh, start.sh
  mini-services-build.sh, mini-services-install.sh, mini-services-start.sh
scripts/
  start-with-migrations.mjs     → Production start with auto-migration
  ensure-admin.mjs              → Bootstrap default admin user
  copy-standalone-assets.mjs    → Post-build asset copy for standalone output
mini-services/                  → Reserved for future micro-services
  .gitkeep
```

**Main responsibilities:**

- Production deployment: PostgreSQL 16, migration job (runs once), Next.js app
- Reverse proxy: Caddy handles TLS, custom domain routing, port transform
- Development convenience scripts in `.zscripts/`
- Admin bootstrap: `ensure-admin.mjs` creates default admin if none exists

**Key files:**

- `docker-compose.yml` — migration runs as a separate one-shot service before the app starts
- `Dockerfile` — standalone output with `sharp` and Prisma binary target
- `scripts/start-with-migrations.mjs` — graceful startup: runs `prisma migrate deploy`, then boots Next.js
- `Caddyfile` — main domain reverse proxy + on-demand TLS for reseller custom domains

**Relationships:**

- Environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `WILROP_ADMIN_*`
- Custom domain TLS flow: Caddy → `api/public/reseller-resolve/check-domain` → Prisma → Reseller.customDomain

---

## 11. Configuration & Tooling

Project configuration, linting, and development tooling.

```text
package.json                    → Dependencies & scripts (bun)
tsconfig.json                   → TypeScript configuration
eslint.config.mjs               → ESLint v9 flat config
next.config.ts                  → Next.js config (standalone, cache headers)
tailwind.config.ts              → Tailwind v4 config
postcss.config.mjs              → PostCSS with Tailwind plugin
components.json                 → Shadcn UI config
.gga                            → Git guardian assistant config
.dockerignore, .gitignore
RESTRUCTURING_RULES.md          → Code conventions (colors, DRY, separation of concerns)
AI_CONTEXT.md                   → AI agent memory: recent changes and decisions
openspec/                       → OpenAPI/AsyncAPI specs
  config.yaml, specs/, changes/
```

**Key files:**

- `package.json` — bun scripts: `dev`, `build`, `start`, `lint`, `db:*`, `test:catalog`
- `next.config.ts` — `output: "standalone"`, no-cache headers for HTML
- `RESTRUCTURING_RULES.md` — mandatory conventions for all future development
- `AI_CONTEXT.md` — chronological log of architectural decisions for AI agents

**Relationships:**

- `eslint.config.mjs` lints across all source files
- `openspec/` defines API contracts consumed by the public and private endpoints

---

## 12. Additional Utility Libraries

Standalone utility modules under `src/lib/` that are framework-agnostic.

```text
src/lib/
  utils.ts                      → General helpers (cn, safeJsonParse, etc.)
  json.ts                       → JSON parsing/serialization utilities
  currency.ts                   → COP formatting (toLocaleString)
  date.ts                       → Date formatting (date-fns wrappers)
  seo.ts                        → SEO metadata generation
  team.ts                       → Team member data (single source of truth)
  contact.ts                    → Contact form logic
  upload-utils.ts               → File upload handling
  booking-validation.ts         → Booking data validation schemas
  amenities-config.ts           → Hotel amenities catalog
```

**Key files:**

- `src/lib/currency.ts` — must always be used for currency formatting (DRY rule)
- `src/lib/date.ts` — must always be used for date formatting
- `src/lib/json.ts` — safe JSON parse (no inline `JSON.parse` in components)
