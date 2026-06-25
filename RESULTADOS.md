# Resultados de Pruebas — Aprobación de Productos de Revendedores

**Rama:** feat/reseller-product-approval
**Fecha:** 2026-06-25

---

## 1. Revendedor crea producto

`powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reseller/auth" -Method POST -Body '{"email":"test2@wilrop.com","password":"test123456"}' -ContentType "application/json" -SessionVariable r | Out-Null
$pkg = Invoke-RestMethod -Uri "http://localhost:3000/api/reseller/products/packages" -Method POST -Body '{"title":"Paquete Prueba Final","price":200,"active":true}' -ContentType "application/json" -WebSession $r
$pkg.data | Select-Object id, title, publishStatus, active | ConvertTo-Json
`

**Resultado:** publishStatus: "pending_review"

## 2. Admin lista pendientes

`powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/auth" -Method POST -Body '{"email":"admin@wilrop.com","password":"admin123"}' -ContentType "application/json" -SessionVariable a | Out-Null
$pending = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/products/pending" -WebSession $a
$pending.data | ForEach-Object { "$($_.type) | $($_.product.title ?? $_.product.name) | $($_.reseller.companyName)" }
`

**Resultado:** 1 pendiente: package | Paquete Prueba Final | Test Agency 2

## 3. Admin aprueba

`powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/auth" -Method POST -Body '{"email":"admin@wilrop.com","password":"admin123"}' -ContentType "application/json" -SessionVariable a | Out-Null
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/products/package/cmqu0cped0001pgjoategr9o6/review" -Method PATCH -Body '{"action":"approve"}' -ContentType "application/json" -WebSession $a | ConvertTo-Json
`

**Resultado:** { "success": true, "message": "Producto \"Paquete Prueba Final\" aprobado" }

## 4. Revendedor verifica

`powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reseller/auth" -Method POST -Body '{"email":"test2@wilrop.com","password":"test123456"}' -ContentType "application/json" -SessionVariable r | Out-Null
$pkg = Invoke-RestMethod -Uri "http://localhost:3000/api/reseller/products/packages/cmqu0cped0001pgjoategr9o6" -WebSession $r
$pkg.data.publishStatus
`

**Resultado:** approved

## 5. Visible en API publica

`powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/public/packages?resellerId=cmqu0390m0001pgf8r4nbwb4g" | ForEach-Object { $_.data.title }
`

**Resultado:** Paquete Prueba Final (visible)

## Resumen

| Paso | Estado |
|---|---|
| Fase 1 — Schema + migracion | Aplicada en DB |
| Fase 2 — Creacion con pending_review | OK |
| Fase 3 — Admin lista pendientes y aprueba | 1 pendiente, aprobado |
| Fase 4 — API publica filtra por approved | Visible via catalogo |
| Fase 5 — Panel admin UI | /admin/revision-productos |
| Fase 6 — Badge en panel revendedor | Ambar/verde/rojo |
