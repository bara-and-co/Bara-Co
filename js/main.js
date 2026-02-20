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
