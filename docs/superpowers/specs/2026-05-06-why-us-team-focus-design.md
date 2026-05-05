# Diseño: Sección "¿Por qué viajar con nosotros?" enfocada en equipo

## Objetivo
Convertir la sección actual para que comunique principalmente al equipo de WILROP, mostrando cada integrante con una descripción corta (nombre y rol), reutilizando la información de imágenes ya cargadas.

## Alcance
- Actualizar la fuente de datos del equipo en `src/lib/team.ts`.
- Ajustar render en `src/components/portal/WhyUsSection.tsx`.
- Mantener estructura visual general de la sección (header, galería, CTA).
- Retirar tarjetas de beneficios genéricos para priorizar el bloque de equipo.

## Fuera de alcance
- Cambios en otras secciones del home.
- Cambios de estilo global o tokens de diseño.
- Cambios en navegación o rutas.

## Diseño de datos
En `teamAssets.whyUsPhotos`, cada elemento tendrá:
- `imageSrc`: ruta de la imagen.
- `alt`: texto alternativo específico por persona.
- `name`: nombre visible del integrante.
- `role`: descripción corta/cargo.

Esto centraliza el contenido en una sola fuente (`team.ts`) y evita hardcode en el componente.

## Diseño UI/UX
- El título principal puede mantenerse como "¿Por qué viajar con nosotros?".
- La sección secundaria enfatiza "Nuestro equipo" mediante el contenido de tarjetas.
- Cada tarjeta de foto mostrará:
- Imagen.
- Overlay/degradado para legibilidad.
- Nombre del integrante.
- Rol corto debajo del nombre.
- Se elimina el grid de `features` para evitar mezclar mensajes y dejar foco 100% equipo.
- Se mantiene el CTA inferior existente ("Reserva tu viaje con confianza").

## Flujo de render
1. `WhyUsSection` obtiene `photos` desde `teamAssets.whyUsPhotos`.
2. Itera tarjetas con `imageSrc`, `alt`, `name`, `role`.
3. Renderiza caption sobre la imagen con buena legibilidad.
4. Renderiza CTA final sin cambios de comportamiento.

## Manejo de errores y resiliencia
- Si un item no tuviera `name` o `role`, el tipo de TypeScript debe detectarlo en compilación.
- Si una imagen falla, el `alt` sigue describiendo correctamente el contenido para accesibilidad.

## Pruebas y validación
- Validar compilación TypeScript.
- Revisar visualmente sección en home:
- Se ven 3 integrantes con nombre + rol.
- Se eliminó bloque de `features`.
- CTA funciona igual que antes.
- Verificar que no haya errores de lint/diagnóstico en archivos editados.

## Riesgos
- Riesgo bajo: cambio acotado a un componente y a datos del equipo.
- Riesgo principal: textos demasiado largos en `role`; se recomienda mantener roles cortos.

## Criterios de aceptación
- La sección muestra al equipo (no beneficios genéricos).
- Cada imagen tiene caption corto identificando a la persona.
- La data proviene de `src/lib/team.ts` y no está duplicada en el componente.
- El CTA continúa navegando a destinos.
