/**
 * carrito.js — Bara & Co (compatibility shim)
 * ─────────────────────────────────────────────────────────────────────────────
 * Este archivo ya NO necesita usarse directamente.
 * La lógica completa del carrito vive en carrito-ui.js, que incluye el
 * drawer, los estilos y todas las funciones públicas.
 *
 * Si alguna página todavía carga carrito.js, este archivo simplemente
 * verifica que carrito-ui.js ya esté cargado. Si no, lo carga dinámicamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  // Si carrito-ui.js ya inyectó el panel, no hacer nada.
  if (document.getElementById('bcPanel')) return;

  // Cargarlo dinámicamente desde la misma carpeta js/
  const script = document.createElement('script');
  const base   = document.currentScript
    ? document.currentScript.src.replace('carrito.js', '')
    : 'js/';
  script.src = base + 'carrito-ui.js';
  document.head.appendChild(script);
})();
