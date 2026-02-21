/**
 * main.js — Bara & Co
 * Funciones globales complementarias.
 * El carrito está en carrito.js.
 */

// Header scroll — también manejado en carrito.js como fallback
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();
// Solo activar el cursor custom en dispositivos con mouse (no táctiles)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  // ... todo el código del cursor custom va acá adentro ...
}
