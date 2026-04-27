# Archivos archivados

Esta carpeta centraliza archivos no críticos para runtime (pruebas, snapshots, logs y reportes históricos) que antes estaban en la raíz del repositorio.

## Estructura

- `scripts/`: scripts de prueba o utilidades locales no usadas por el build/runtime.
- `logs/`: logs y archivos de estado temporales.
- `snapshots/`: capturas HTML/exportes puntuales de verificación.
- `reports/`: reportes y bitácoras de trabajo históricas.
- `examples/`: ejemplos de referencia no usados por la app en producción.
- `misc/`: artefactos sueltos no críticos.

## Nota

No se movieron archivos de ejecución (Docker/Next/Prisma) ni archivos referenciados por código o configuración.
