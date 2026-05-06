# AI Context

## 2026-05-06
- La sección `WhyUsSection` mantiene dos bloques: equipo (fotos con `name`/`role`) y tarjetas de beneficios comerciales.
- Los textos visibles de cada foto (`name`, `role`, `alt`) se centralizan en `src/lib/team.ts` para mantener una sola fuente de verdad.
- Autenticación de panel (admin/subagent/reseller): passwords se verifican con bcrypt cuando están hasheados y se soporta compatibilidad legacy; al iniciar sesión con password legacy se actualiza automáticamente a bcrypt.
