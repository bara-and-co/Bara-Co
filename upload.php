<?php
/**
 * upload.php — Bara & Co
 * Recibe imágenes desde el admin y las guarda en /images/productos/
 * Colocar en la raíz del sitio.
 * Crear la carpeta: mkdir -p images/productos && chmod 775 images/productos
 */

// ─── CORS ────────────────────────────────────────────────────────────────────
// Permitir llamadas desde el mismo dominio y localhost (desarrollo)
$allowedOrigins = [
    'https://baraandco.com.ar',
    'http://baraandco.com.ar',
    'https://www.baraandco.com.ar',
    'http://www.baraandco.com.ar',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins) || empty($origin)) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} else {
    header('Access-Control-Allow-Origin: https://baraandco.com.ar');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Responder al preflight OPTIONS del navegador
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ─────────────────────────────────────────────────────────────────────────────

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
    $uploadErrors = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera upload_max_filesize en php.ini',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera MAX_FILE_SIZE del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió parcialmente',
        UPLOAD_ERR_NO_FILE    => 'No se subió ningún archivo',
        UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal del servidor',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir en disco',
        UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida',
    ];
    $msg = $uploadErrors[$file['error']] ?? 'Error desconocido: código ' . $file['error'];
    http_response_code(400);
    echo json_encode(['error' => $msg]);
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

// Verificar que la carpeta tiene permisos de escritura
if (!is_writable($uploadDir)) {
    http_response_code(500);
    echo json_encode(['error' => 'La carpeta images/productos/ no tiene permisos de escritura. Ejecutá: chmod 775 images/productos']);
    exit;
}

$destPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar la imagen. Verificá permisos de la carpeta images/productos/']);
    exit;
}

// Construir URL pública
$scheme    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host      = $_SERVER['HTTP_HOST'];
$publicUrl = $scheme . '://' . $host . '/images/productos/' . $filename;

echo json_encode(['url' => $publicUrl, 'filename' => $filename]);
