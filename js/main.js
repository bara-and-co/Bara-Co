/**
 * main.js — Bara & Co
 * Funciones globales: header scroll + cursor custom.
 * El carrito está en carrito.js.
 */

// ── HEADER SCROLL ──
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ── CURSOR CUSTOM ──
// Solo se activa en dispositivos con mouse real (no táctiles)
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cur  = document.getElementById('cur');
  const ring = document.getElementById('curRing');
  if (!cur || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  // El punto sigue el mouse directamente
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  // El anillo sigue con inercia
  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();
