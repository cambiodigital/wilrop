#!/usr/bin/env pwsh
# Script para probar el endpoint de upload

# Configuración
$BASE_URL = "http://localhost:3000"
$TEST_IMAGE_PATH = "test-image.jpg"

Write-Host "Upload Endpoint Test Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Crear una imagen de test (1x1 pixel JPG mínimo)
Write-Host "Creando imagen de test..." -ForegroundColor Yellow

# Crear una imagen JPG válida de 1x1 píxel
$jpgBytes = @(
    255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0,
    255, 219, 0, 67, 0, 8, 6, 6, 7, 6, 5, 8, 7, 7, 7, 9, 9, 8, 10, 12, 20,
    13, 12, 11, 13, 15, 18, 18, 17, 15, 17, 17, 20, 22, 28, 23, 24, 22, 26,
    23, 17, 17, 24, 35, 27, 29, 26, 31, 34, 34, 34, 19, 27, 39, 40, 40, 40,
    21, 29, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34,
    34, 34, 34, 34, 34, 34, 34, 34, 255, 201, 0, 11, 8, 0, 1, 0, 1, 17, 0,
    255, 204, 0, 20, 16, 0, 1, 5, 17, 0, 2, 17, 3, 17, 0, 63, 0, 250, 85, 255,
    217
)

[System.IO.File]::WriteAllBytes($TEST_IMAGE_PATH, $jpgBytes)
Write-Host "Imagen de test creada: $TEST_IMAGE_PATH" -ForegroundColor Green
Write-Host ""

# Prueba 1: Upload válido
Write-Host "Prueba 1: Upload valido" -ForegroundColor Cyan
Write-Host "URL: POST $BASE_URL/api/upload"
Write-Host ""

$form = @{
    file = Get-Item $TEST_IMAGE_PATH
}

try {
    $response = Invoke-WebRequest `
        -Uri "$BASE_URL/api/upload" `
        -Method POST `
        -Form $form `
        -ContentType "multipart/form-data"

    $data = $response.Content | ConvertFrom-Json

    if ($data.success) {
        Write-Host "EXITO" -ForegroundColor Green
        Write-Host "Respuesta:"
        Write-Host "  - Message: $($data.message)"
        Write-Host "  - File URL: $($data.fileUrl)"
        Write-Host "  - Filename: $($data.filename)"
        $UPLOADED_URL = $data.fileUrl
    } else {
        Write-Host "FALLO" -ForegroundColor Red
        Write-Host "Respuesta:"
        Write-Host "  - Message: $($data.message)"
        Write-Host "  - Error: $($data.error)"
    }
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan

# Limpieza
Remove-Item $TEST_IMAGE_PATH -Force
Write-Host "Archivos de test eliminados" -ForegroundColor Yellow

Write-Host ""
Write-Host "Test completado" -ForegroundColor Cyan
