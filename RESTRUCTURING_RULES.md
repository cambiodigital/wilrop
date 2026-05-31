# Reglas Permanentes de Desarrollo y Reestructuración

A partir de ahora, todo el desarrollo en este repositorio debe cumplir estrictamente con los siguientes principios y reglas de arquitectura modular y código limpio. Cualquier código que no cumpla con estas pautas debe ser rechazado automáticamente.

## 1. Centralización de Estilos y Colores
* **NO usar colores hexadecimales (`#ffffff`, `#1F3556`, etc.) directamente en los archivos `.tsx`** para el diseño de la interfaz de usuario.
* Todos los colores deben provenir de la configuración de Tailwind (clases semánticas como `bg-primary`, `text-muted`, `border-border`) o estar mapeados como variables CSS en `src/app/globals.css` (dentro de la directiva `@theme inline` por ser Tailwind v4).
* Los estilos de diseño que requieran "Quiet Luxury" y consistencia visual deben reutilizar las clases utilitarias definidas en `globals.css` como `.page-header`, `.form-section-title`, `.dialog-footer`, `.label-required`, y `.label-muted`.

## 2. Separación de Responsabilidades en Páginas (App Router)
* **Las páginas de la carpeta `src/app/` deben ser "ensambladores" puros.**
* Las páginas de ruta NO deben contener JSX complejo o sobredimensionado. El JSX estructurado (layouts, secciones, formularios grandes) debe ubicarse en componentes dedicados en `src/components/`.
* Las páginas de ruta (Server Components) NO deben realizar lógica de consulta directa a la base de datos (joins de Prisma, fallbacks de plantillas complejos) directamente en el cuerpo de la página. Esta lógica debe encapsularse en servicios o utilidades dedicadas en `src/lib/`.
* La lógica de estado (hooks como `useState`, `useEffect`, etc.) o de eventos complejos en componentes interactivos de cliente debe extraerse a hooks personalizados en `src/hooks/`.

## 3. Globalización de Funciones (DRY)
* **NO declarar funciones utilitarias puras de forma local dentro de componentes o páginas.**
* Las utilidades de análisis estructurado (como `safeJsonParse`), formateo de monedas (`toLocaleString('es-CO')`), formateo de fechas, y validaciones comunes deben ubicarse de manera única en la carpeta `src/lib/` (ej. `src/lib/json.ts`, `src/lib/currency.ts`, `src/lib/date.ts`, `src/lib/utils.ts`).
* Siempre importa y reutiliza estas funciones globales en lugar de volver a implementarlas localmente.

## 4. Consistencia en la Interfaz de Usuario
* Todo el desarrollo de interfaz interactiva debe priorizar y utilizar los componentes base globales de `src/components/ui/` (Shadcn UI).
* Evita el uso de botones (`<button>`) o entradas de texto (`<input>`) nativas de HTML cuando existan componentes correspondientes de Shadcn que aseguren consistencia de foco, estados de carga y diseño visual premium de la marca.
