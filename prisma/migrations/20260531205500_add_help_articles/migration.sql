-- CreateHelpArticle
CREATE TABLE "HelpArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL DEFAULT '',
    "imageLabels" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HelpArticle_slug_key" ON "HelpArticle"("slug");
CREATE INDEX "HelpArticle_category_published_idx" ON "HelpArticle"("category", "published");
CREATE INDEX "HelpArticle_sortOrder_idx" ON "HelpArticle"("sortOrder");

-- SeedInitialDocumentation
INSERT INTO "HelpArticle" (
    "id",
    "slug",
    "title",
    "category",
    "content",
    "imageLabels",
    "published",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES
(
    'help_initial_support_overview',
    'guia-general-del-panel',
    'Guía general del panel',
    'general',
    '# Guía general del panel

El panel reúne las operaciones principales del revendedor: catálogo, reservas, clientes, ventas, comisiones y Marca Blanca.

## Orden sugerido de configuración

1. Revisá los datos de perfil.
2. Confirmá la configuración de Marca Blanca.
3. Validá destinos asignados.
4. Publicá productos en el Catálogo Activo.
5. Revisá reservas y ventas desde los módulos operativos.

[Captura: Navegación lateral del panel reseller]

## Criterio de consistencia

Si un producto no aparece en el portal B2C, revisá primero que esté activo en catálogo y que su destino padre siga asignado.',
    '["[Captura: Navegación lateral del panel reseller]"]',
    true,
    5,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'help_initial_booking_management',
    'como-gestionar-reservas',
    'Cómo gestionar reservas',
    'bookings',
    '# Cómo gestionar reservas

Usá el módulo de reservas para revisar solicitudes, confirmar datos del pasajero y acompañar el estado operativo de cada venta.

## Flujo recomendado

1. Ingresá al panel y abrí **Reservas**.
2. Revisá huésped, fechas, producto, tarifa y estado.
3. Validá que el `resellerId` y el canal B2B/B2C correspondan al origen de la operación.
4. Actualizá el estado solo cuando la información comercial esté confirmada.

[Captura: Listado de reservas con filtros de estado]

## Buenas prácticas

- Mantené las notas internas claras y accionables.
- Confirmá disponibilidad antes de prometer fechas al cliente.
- Usá el historial de ventas para revisar comisiones y trazabilidad.',
    '["[Captura: Listado de reservas con filtros de estado]"]',
    true,
    10,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'help_initial_whitelabel_setup',
    'configuracion-de-marca-blanca',
    'Configuración de Marca Blanca',
    'whitelabel',
    '# Configuración de Marca Blanca

La Marca Blanca centraliza cómo se presenta el portal B2C del revendedor. La configuración se gestiona desde **Marca Blanca** en el panel reseller.

## Qué controla

- Identidad visual del portal.
- Datos comerciales visibles para el cliente final.
- Presentación de productos publicados en el Catálogo Activo.

[Captura: Pantalla de configuración de Marca Blanca]

## Relación con el catálogo

Todo producto activo en el catálogo del revendedor puede aparecer en el portal B2C con el margen configurado. Si el producto no pertenece a un destino asignado, no debe publicarse.

## B2B y B2C

- **B2B:** el revendedor gestiona clientes y ventas desde su panel.
- **B2C:** el cliente final compra en el portal del revendedor usando su marca.',
    '["[Captura: Pantalla de configuración de Marca Blanca]"]',
    true,
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'help_initial_commissions',
    'comisiones-y-pagos',
    'Comisiones y pagos',
    'commissions',
    '# Comisiones y pagos

El módulo de comisiones permite revisar cuánto corresponde al revendedor por cada venta registrada en la plataforma.

## Qué revisar

- Monto total de la venta.
- Comisión calculada.
- Estado de la operación.
- Cliente o reserva asociada.

[Captura: Panel de comisiones con ventas y estados]

## Recomendación operativa

Validá que cada reserva tenga el canal correcto antes de cerrar una liquidación. Las ventas B2B y B2C pueden tener trazabilidad diferente, pero ambas deben conservar el `resellerId` asociado.

## Estados

- **Pendiente:** operación registrada pero no liquidada.
- **Confirmada:** venta validada comercialmente.
- **Pagada:** comisión liquidada.',
    '["[Captura: Panel de comisiones con ventas y estados]"]',
    true,
    40,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'help_initial_clients',
    'gestion-de-clientes',
    'Gestión de clientes',
    'clients',
    '# Gestión de clientes

El módulo de clientes ayuda al revendedor a mantener una base ordenada de pasajeros y compradores frecuentes.

## Datos recomendados

- Nombre completo.
- Email y teléfono.
- País o ciudad de origen.
- Notas comerciales relevantes.

[Captura: Ficha de cliente con historial de compras]

## Uso B2B

En ventas B2B, el revendedor puede gestionar sus propios clientes desde el panel y asociar reservas a esa cartera.

## Buenas prácticas

- Evitá duplicados revisando email o teléfono antes de crear un cliente.
- Usá notas breves y útiles para seguimiento comercial.
- Mantené datos sensibles solo cuando sean necesarios para la operación.',
    '["[Captura: Ficha de cliente con historial de compras]"]',
    true,
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'help_initial_catalog_management',
    'gestion-del-catalogo-de-productos',
    'Gestión del catálogo de productos',
    'catalog',
    '# Gestión del catálogo de productos

El catálogo define qué destinos y productos puede vender un revendedor. Primero se asignan destinos; luego se agregan productos vinculados a esos destinos.

## Regla principal

Un hotel, excursión, paquete o transporte solo debe agregarse si su destino padre ya está asignado al revendedor.

[Captura: Selector de productos disponibles del catálogo]

## Cómo agregar productos

1. Abrí **Catálogo** en el panel reseller.
2. Verificá que el destino esté asignado y activo.
3. Agregá productos relacionados desde la vista de disponibles.
4. Configurá precio personalizado, descripción o destacado si corresponde.

## Control de publicación

El portal B2C consume el Catálogo Activo. Desactivar un ítem lo retira de la venta sin borrar su configuración.',
    '["[Captura: Selector de productos disponibles del catálogo]"]',
    true,
    30,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
