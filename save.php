<?php
/**
 * save.php — Bara & Co
 * Recibe el JSON de productos desde el admin y lo guarda en /productos.json
 * Colocar en la raíz del sitio (mismo nivel que productos.json y admin.html)
 */

// Seguridad básica: solo aceptar desde el mismo origen
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host   = $_SERVER['HTTP_HOST'] ?? '';

// Permitir solo llamadas del mismo dominio
if ($origin && parse_url($origin, PHP_URL_HOST) !== $host) {
    http_response_code(403);
    echo json_encode(['error' => 'Origen no permitido']);
    exit;
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Leer body
$body = file_get_contents('php://input');
if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Body vacío']);
    exit;
}

// Validar que sea JSON válido
$data = json_decode($body);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

// Ruta de destino
$target = __DIR__ . '/productos.json';

// Backup del archivo anterior (por si algo sale mal)
if (file_exists($target)) {
    copy($target, $target . '.bak');
}

// Guardar con formato legible
$written = file_put_contents($target, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

if ($written === false) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo escribir el archivo. Verificá permisos (chmod 664 productos.json)']);
    exit;
}

header('Content-Type: application/json');
echo json_encode(['ok' => true, 'bytes' => $written, 'productos' => count((array)$data)]);
