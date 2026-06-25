# Plan de Implementación: Aprobación de Productos de Revendedores

**Rama:** `feat/reseller-product-approval`
**Objetivo:** Los productos creados por cuentas de revendedor requieren aprobación de un admin antes de ser visibles públicamente.

---

## Fase 1 — Migración de Schema y DB

Agregar `publishStatus` a los 6 modelos de producto.

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Agregar `publishStatus String @default("approved")` a `TravelPackage`, `Hotel`, `Excursion`, `Cruise`, `TransportService`, `Destination` |
| DB | Ejecutar `npx prisma migrate dev` y generar cliente |

**Valores:** `"pending_review"` | `"approved"` | `"rejected"`
**Default:** `"approved"` para que productos existentes (admin, templates) sigan sin cambios.

---

## Fase 2 — API Revendedor: Crear con `pending_review`

Cuando un revendedor crea un producto, se guarda con `publishStatus: "pending_review"`.

| Archivo | Cambio |
|---|---|
| `src/app/api/reseller/products/packages/route.ts` | `POST`: agregar `publishStatus: 'pending_review'` |
| `src/app/api/reseller/products/hotels/route.ts` | `POST`: agregar `publishStatus: 'pending_review'` |
| `src/app/api/reseller/products/excursions/route.ts` | `POST`: agregar `publishStatus: 'pending_review'` |
| `src/app/api/reseller/products/cruises/route.ts` | `POST`: agregar `publishStatus: 'pending_review'` |
| `src/app/api/reseller/products/transport/route.ts` | `POST`: agregar `publishStatus: 'pending_review'` |
| `src/app/api/reseller/products/hotel-rooms/route.ts` | `POST`: si aplica |

Los `GET` de cada endpoint deben incluir `publishStatus` en la respuesta.

---

## Fase 3 — API Admin: Revisión de Productos Pendientes

Endpoints para que el admin liste y apruebe/rechace productos de revendedores.

| Archivo | Cambio |
|---|---|
| `src/app/api/admin/products/pending/route.ts` | `GET`: lista todos los productos de revendedores con `publishStatus: "pending_review"`, agrupados por tipo |
| `src/app/api/admin/products/[type]/[id]/review/route.ts` | `PATCH`: aprueba (`approved`) o rechaza (`rejected`) con `reviewNotes` opcional |
| `src/lib/admin/product-review.ts` | Lógica compartida de revisión (verificar admin, actualizar status) |

---

## Fase 4 — API Pública: Filtrar por `publishStatus`

Los endpoints de consulta pública solo retornan productos con `publishStatus: "approved"`.

| Archivo | Cambio |
|---|---|
| `src/app/api/admin/packages/route.ts` | `GET`: filtrar `publishStatus: "approved"` donde `isTemplate: false` |
| `src/app/api/admin/hotels/route.ts` | Igual |
| `src/app/api/admin/excursions/route.ts` | Igual |
| `src/app/api/admin/cruises/route.ts` | Igual |
| `src/app/api/admin/transport-services/route.ts` | Igual |
| `src/app/api/admin/destinations/route.ts` | Igual (si aplica) |
| APIs públicas de catálogo | Igual filtro |

Los templates (`isTemplate: true`) se muestran solo cuando no hay productos reales aprobados.

---

## Fase 5 — Panel Admin: UI de Revisión de Productos

Nueva sección en el panel admin para revisar productos pendientes.

| Archivo | Cambio |
|---|---|
| `src/app/admin/(panel)/revision-productos/page.tsx` | Página nueva con tabla de productos pendientes |
| `src/components/admin/AdminProductReview.tsx` | Componente: tabla/tabs por tipo de producto, filtros por revendedor, botones aprobar/rechazar con modal y `reviewNotes` |
| `src/components/admin/AdminSidebar.tsx` | Agregar item "Revisión de Productos" al menú |

---

## Fase 6 — Panel Revendedor: Indicador de Estado

El revendedor ve el estado de revisión de cada producto.

| Archivo | Cambio |
|---|---|
| Componentes de listado del revendedor | Badge con color semántico: amarillo `pending_review`, verde `approved`, rojo `rejected` + `reviewNotes` como tooltip |
| Formularios de creación | Mensaje: "Tu producto quedará en revisión y será visible públicamente una vez aprobado por un administrador" |

---

## Resumen de impacto

| Capa | Archivos nuevos | Archivos modificados |
|---|---|---|
| Schema | 0 | 1 |
| API | ~3 | ~12 |
| Panel Admin | 2 | 1 |
| Panel Reseller | 0 | ~5 |
| **Total** | **~5** | **~19** |
