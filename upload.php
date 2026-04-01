<?php
/**
 * upload.php — Bara & Co
 * Sube imágenes de productos al servidor.
 * Subilo a la raíz de baraandco.com.ar (mismo nivel que admin.html).
 */

// ── Configuración ──────────────────────────────────────────────
define('UPLOAD_DIR',  __DIR__ . '/imgs/');   // carpeta donde se guardan
define('BASE_URL',    'https://baraandco.com.ar/imgs/'); // URL pública
define('MAX_SIZE',    15 * 1024 * 1024);     // 15 MB
define('ALLOWED',     ['image/jpeg','image/png','image/webp','image/gif']);
define('SECRET_KEY',  'bara2025admin');      // cambiá esto por algo tuyo

// ── CORS — solo desde tu propio dominio ───────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
  'https://baraandco.com.ar',
  'http://baraandco.com.ar',
  'https://www.baraandco.com.ar',
];
if (in_array($origin, $allowed_origins)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  header("Access-Control-Allow-Origin: https://baraandco.com.ar");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { json_err('Método no permitido'); }

// ── Autenticación simple ──────────────────────────────────────
// El admin envía el header X-Admin-Key con el valor de SECRET_KEY
$key = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
if ($key !== SECRET_KEY) {
  http_response_code(403);
  json_err('Sin autorización');
}

// ── Crear carpeta si no existe ────────────────────────────────
if (!is_dir(UPLOAD_DIR)) {
  mkdir(UPLOAD_DIR, 0755, true);
}

// ── Validar archivo ───────────────────────────────────────────
if (empty($_FILES['imagen'])) json_err('No se recibió ningún archivo');
$f = $_FILES['imagen'];

if ($f['error'] !== UPLOAD_ERR_OK) json_err('Error al recibir el archivo: ' . $f['error']);
if ($f['size'] > MAX_SIZE)         json_err('El archivo supera 15MB');

$mime = mime_content_type($f['tmp_name']);
if (!in_array($mime, ALLOWED))     json_err("Tipo no permitido: $mime");

// ── Nombre único seguro ───────────────────────────────────────
$ext      = match($mime) {
  'image/jpeg' => 'jpg',
  'image/png'  => 'png',
  'image/webp' => 'webp',
  'image/gif'  => 'gif',
  default      => 'jpg'
};
$base     = preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($f['name'], PATHINFO_FILENAME));
$base     = substr($base, 0, 40);
$filename = $base . '-' . time() . '.' . $ext;
$dest     = UPLOAD_DIR . $filename;

// ── Mover archivo ─────────────────────────────────────────────
if (!move_uploaded_file($f['tmp_name'], $dest)) {
  json_err('No se pudo guardar el archivo (verificá permisos de la carpeta /imgs/)');
}

// ── Éxito ─────────────────────────────────────────────────────
echo json_encode([
  'ok'       => true,
  'url'      => BASE_URL . $filename,
  'filename' => $filename,
]);

function json_err(string $msg): never {
  echo json_encode(['ok' => false, 'error' => $msg]);
  exit;
}
