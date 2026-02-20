/**
 * carrito.js — Bara & Co
 * Sistema de carrito unificado para todas las páginas.
 * Funciona con index.html, tienda.html, producto.html y lookbook.html
 */

(function () {
  const CART_KEY = 'bc_cart';

  /* ─────────────────────────────────────────
     HELPERS: leer/guardar carrito
  ───────────────────────────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ─────────────────────────────────────────
     DETECCIÓN DE ELEMENTOS DEL CARRITO
     (cada página puede tener distinta estructura)
  ───────────────────────────────────────── */
  function getEls() {
    return {
      // Panel lateral
      panel:   document.querySelector('.cart-panel')
             || document.getElementById('cartPanel')
             || document.getElementById('cartDrawer'),

      // Fondo oscuro
      overlay: document.querySelector('.overlay')
             || document.getElementById('overlay')
             || document.querySelector('.cart-backdrop')
             || document.getElementById('cartBackdrop'),

      // Zona de items
      items:   document.querySelector('.cart-items')
             || document.getElementById('cdBody'),

      // Zona vacío
      empty:   document.querySelector('.cart-empty')
             || document.getElementById('cdEmpty'),

      // Footer (subtotal + botones)
      footer:  document.querySelector('.cart-footer')
             || document.querySelector('.cd-foot'),

      // Badges / contadores en el header
      badges:  document.querySelectorAll(
                 '.cart-count, .cart-badge, .cart-dot, #cartDot, #cdTotal'
               ),

      // Notificación toast
      notif:   document.getElementById('cartNotification')
             || document.querySelector('.cart-notification'),
    };
  }

  /* ─────────────────────────────────────────
     TOGGLE CARRITO
  ───────────────────────────────────────── */
  window.toggleCart = function () {
    const { panel, overlay } = getEls();
    if (!panel) return;

    const isOpen = panel.classList.contains('open');

    if (isOpen) {
      panel.classList.remove('open');
      if (overlay) {
        overlay.classList.remove('open');
        overlay.classList.remove('active');
      }
    } else {
      renderCart();
      panel.classList.add('open');
      if (overlay) {
        overlay.classList.add('open');
        overlay.classList.add('active');
      }
    }
  };

  /* ─────────────────────────────────────────
     RENDER CARRITO
  ───────────────────────────────────────── */
  function renderCart() {
    const cart = getCart();
    const { items, empty, footer, badges } = getEls();

    const totalQty  = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const subtotal  = cart.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);

    // Actualizar todos los badges/contadores
    badges.forEach(el => {
      if (el.id === 'cdTotal') {
        el.textContent = '$' + subtotal.toLocaleString('es-AR');
      } else {
        el.textContent = totalQty;
        el.classList.toggle('on', totalQty > 0);
      }
    });

    if (!items) return;

    // Limpiar items anteriores
    items.querySelectorAll('.cart-item, .cd-item').forEach(e => e.remove());

    // Mostrar/ocultar vacío
    if (empty) empty.style.display = cart.length ? 'none' : 'block';

    // Renderizar items
    cart.forEach(item => {
      const nombre = item.nombre || 'Producto';
      const precio = item.precio || 0;
      const imagen = item.imagen || '';
      const qty    = item.qty || 1;
      const id     = item.id || nombre;
      const talle  = item.talle ? `<div class="item-talle">Talle: ${item.talle}</div>` : '';
      const color  = item.color ? `<div class="item-color">Color: ${item.color}</div>`  : '';

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="item-image">
          <img src="${imagen}" alt="${nombre}" onerror="this.style.display='none'"/>
        </div>
        <div class="item-details">
          <h4>${nombre}</h4>
          ${talle}${color}
          <div class="item-price">$${(precio * qty).toLocaleString('es-AR')}</div>
          <div class="item-actions">
            <div class="item-quantity">
              <button class="qty-btn" onclick="cambiarCantidad('${id}', -1)">−</button>
              <span class="quantity">${qty}</span>
              <button class="qty-btn" onclick="cambiarCantidad('${id}', 1)">+</button>
            </div>
            <button class="remove-item" onclick="eliminarItem('${id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>`;
      items.appendChild(el);
    });

    // Footer con subtotal y botones de pago
    if (footer) {
      if (cart.length === 0) {
        footer.innerHTML = '';
      } else {
        footer.innerHTML = `
          <div class="subtotal">
            <span>Subtotal</span>
            <span>$${subtotal.toLocaleString('es-AR')}</span>
          </div>
          <button class="pay-btn pay-mp" onclick="pagarMP()">
            <i class="fab fa-cc-visa"></i> Pagar con MercadoPago
          </button>
          <button class="pay-btn pay-wa" onclick="pagarWA()">
            <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
          </button>
          <p class="pay-note"><i class="fas fa-lock"></i> Pago 100% seguro</p>`;
      }
    }
  }

  /* ─────────────────────────────────────────
     AGREGAR AL CARRITO
  ───────────────────────────────────────── */
  window.agregarAlCarrito = function (id, nombre, precio, imagen, talle, color) {
    const cart = getCart();
    precio = parseFloat(precio) || 0;

    const key = id + (talle ? '-' + talle : '') + (color ? '-' + color : '');

    const existing = cart.find(i => i.id === key);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id: key, nombre, precio, imagen: imagen || '', talle: talle || '', color: color || '', qty: 1 });
    }

    saveCart(cart);
    renderCart();
    mostrarNotificacion(nombre);

    // Abrir panel
    const { panel, overlay } = getEls();
    if (panel && !panel.classList.contains('open')) {
      panel.classList.add('open');
      if (overlay) { overlay.classList.add('open'); overlay.classList.add('active'); }
    }
  };

  /* ─────────────────────────────────────────
     CAMBIAR CANTIDAD
  ───────────────────────────────────────── */
  window.cambiarCantidad = function (id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, (item.qty || 1) + delta);
    if (item.qty === 0) {
      const idx = cart.indexOf(item);
      cart.splice(idx, 1);
    }
    saveCart(cart);
    renderCart();
  };

  /* ─────────────────────────────────────────
     ELIMINAR ITEM
  ───────────────────────────────────────── */
  window.eliminarItem = function (id) {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
  };

  /* ─────────────────────────────────────────
     NOTIFICACIÓN TOAST
  ───────────────────────────────────────── */
  function mostrarNotificacion(nombre) {
    const notif = getEls().notif;
    if (!notif) return;
    const span = notif.querySelector('span');
    if (span) span.textContent = (nombre || 'Producto') + ' agregado al carrito';
    notif.classList.add('show');
    clearTimeout(notif._t);
    notif._t = setTimeout(() => notif.classList.remove('show'), 3000);
  }

  /* ─────────────────────────────────────────
     PAGAR
  ───────────────────────────────────────── */
  window.pagarWA = function () {
    const cart = getCart();
    if (!cart.length) return;
    const lineas = cart.map(i => {
      const q = i.qty || 1;
      return `• ${i.nombre}${q > 1 ? ' x' + q : ''} — $${((i.precio || 0) * q).toLocaleString('es-AR')}`;
    }).join('%0A');
    const total = cart.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);
    window.open(
      `https://wa.me/5493525614281?text=Hola!%20Quiero%20pedir:%0A${lineas}%0A%0ATotal:%20$${total.toLocaleString('es-AR')}`,
      '_blank'
    );
  };

  window.pagarMP = function () {
    const cart = getCart();
    if (!cart.length) { alert('Tu carrito está vacío'); return; }
    const total = cart.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);
    window.open('https://link.mercadopago.com.ar/baraandco?amount=' + total, '_blank');
  };

  /* ─────────────────────────────────────────
     HEADER SCROLL
  ───────────────────────────────────────── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     INICIALIZAR al cargar
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    renderCart();
  });

})();
