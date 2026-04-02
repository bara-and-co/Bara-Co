<?php
/**
 * upload.php — Bara & Co
 * Recibe imágenes desde el admin y las guarda en /images/productos/
 * Colocar en la raíz del sitio.
 * Crear la carpeta: mkdir -p images/productos && chmod 775 images/productos
 */

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar que llegó un archivo
if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo']);
    exit;
}

$file = $_FILES['file'];

// Verificar errores de subida
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Error en la subida: código ' . $file['error']]);
    exit;
}

// Validar tamaño (máx 10MB)
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'La imagen supera los 10MB']);
    exit;
}

// Validar tipo MIME real (no solo la extensión)
$finfo    = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido: ' . $mimeType]);
    exit;
}

// Extensión según MIME
$extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$ext    = $extMap[$mimeType];

// Nombre único basado en tiempo + random
$filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

// Carpeta destino
$uploadDir = __DIR__ . '/images/productos/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

$destPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar la imagen. Verificá permisos de la carpeta images/productos/']);
    exit;
}

// Construir URL pública
$scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'];
$publicUrl = $scheme . '://' . $host . '/images/productos/' . $filename;

header('Content-Type: application/json');
echo json_encode(['url' => $publicUrl, 'filename' => $filename]);
