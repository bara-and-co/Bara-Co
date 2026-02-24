/**
 * carrito.js — Bara & Co
 * Sistema de carrito unificado.
 * v2 — Conectado a producto.html, tienda.html y admin.html
 *      Mejoras UX: toast, barra envío gratis, stock por talle, checkout claro.
 */

(function () {
  const CART_KEY   = 'bc_cart';
  const ENVIO_FREE = 80000; // umbral envío gratis

  /* ─── HELPERS ─── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ─── DETECCIÓN DE ELEMENTOS
   *  Soporta las dos estructuras de HTML: producto.html y tienda.html
   * ─── */
  function getEls() {
    return {
      // panel: puede llamarse #cartPanel o .cart-panel
      panel:   document.getElementById('cartPanel') || document.querySelector('.cart-panel'),
      // overlay: puede ser #overlay o .overlay
      overlay: document.getElementById('overlay')   || document.querySelector('.overlay'),
      // items wrapper: puede tener clase cart-items-wrap o cart-items (o ambas)
      items:   document.querySelector('.cart-items-wrap') || document.querySelector('.cart-items'),
      // empty: puede estar dentro del wrapper
      empty:   document.querySelector('.cart-empty'),
      // footer: puede ser #cartFooter o .cart-footer
      footer:  document.getElementById('cartFooter') || document.querySelector('.cart-footer'),
      // badges del header
      badges:  document.querySelectorAll('.cart-count, .cart-badge'),
      // toast notificación
      notif:   document.getElementById('cartNotification') || document.querySelector('.cart-notification'),
    };
  }

  /* ─── TOGGLE PANEL ─── */
  window.toggleCart = function () {
    const { panel, overlay } = getEls();
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      if (overlay) { overlay.classList.remove('open'); overlay.classList.remove('active'); }
      document.body.style.overflow = '';
    } else {
      renderCart();
      panel.classList.add('open');
      if (overlay) { overlay.classList.add('open'); overlay.classList.add('active'); }
      document.body.style.overflow = 'hidden';
    }
  };

  /* ─── RENDER PRINCIPAL ─── */
  function renderCart() {
    const cart      = getCart();
    const { items, empty, footer, badges } = getEls();
    const totalQty  = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const subtotal  = cart.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);

    /* Badges del header */
    badges.forEach(el => {
      el.textContent = totalQty;
      if (el.classList.contains('cart-badge')) el.classList.toggle('on', totalQty > 0);
    });

    if (!items) return;

    /* Limpiar items previos */
    items.querySelectorAll('.cart-item').forEach(e => e.remove());

    /* Estado vacío */
    if (empty) empty.style.display = cart.length ? 'none' : '';

    /* Items */
    cart.forEach(item => {
      const nombre = item.nombre || 'Producto';
      const precio = item.precio || 0;
      const imagen = item.imagen || '';
      const qty    = item.qty || 1;
      const id     = item.id || nombre;
      const extras = [
        item.talle && `Talle: ${item.talle}`,
        item.color && `Color: ${item.color}`,
      ].filter(Boolean).join(' · ');

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="item-img">
          <img src="${imagen}" alt="${nombre}" onerror="this.style.display='none'"/>
        </div>
        <div class="item-details">
          <div class="item-name">${nombre}</div>
          ${extras ? `<div class="item-meta">${extras}</div>` : ''}
          <div class="item-price">$${(precio * qty).toLocaleString('es-AR')}</div>
          <div class="item-actions">
            <div class="qty-wrap">
              <button class="qty-btn" onclick="cambiarCantidad('${id}', -1)" aria-label="Menos">−</button>
              <span class="qty-num">${qty}</span>
              <button class="qty-btn" onclick="cambiarCantidad('${id}', 1)" aria-label="Más">+</button>
            </div>
            <button class="remove-btn" onclick="eliminarItem('${id}')" aria-label="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>`;
      items.appendChild(el);
    });

    /* Footer */
    if (!footer) return;

    if (cart.length === 0) {
      footer.innerHTML = '';
      return;
    }

    const falta    = Math.max(0, ENVIO_FREE - subtotal);
    const progreso = Math.min(100, (subtotal / ENVIO_FREE) * 100);
    const envioMsg = falta > 0
      ? `Te faltan <strong>$${falta.toLocaleString('es-AR')}</strong> para envío gratis 🚚`
      : `🎉 <strong>¡Tenés envío gratis!</strong>`;

    footer.innerHTML = `
      <div class="shipping-bar">
        <p class="shipping-msg">${envioMsg}</p>
        <div class="shipping-track"><div class="shipping-fill" style="width:${progreso}%"></div></div>
      </div>
      <div class="subtotal-row">
        <span class="subtotal-label">Subtotal</span>
        <span class="subtotal-amount">$${subtotal.toLocaleString('es-AR')}</span>
      </div>
      <div class="checkout-btns">
        <button class="btn-mp" onclick="pagarMP()">
          <i class="fas fa-credit-card"></i> Pagar con Mercado Pago
        </button>
        <button class="btn-wacheckout" onclick="pagarWA()">
          <i class="fab fa-whatsapp"></i> Confirmar por WhatsApp
        </button>
      </div>
      <p class="security-note">
        <i class="fas fa-lock"></i> Pago 100% seguro · Hasta 6 cuotas sin interés
      </p>`;
  }

  /* ─── MODAL SELECTOR DE TALLE (con stock visible) ─── */
  window.mostrarSelectorTalle = function (id, nombre, precio, imagen, talles) {
    if (!talles || talles.length === 0) {
      agregarAlCarrito(id, nombre, precio, imagen, '', '');
      return;
    }

    let modal = document.getElementById('talleModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'talleModal';
      modal.innerHTML = `
        <div class="talle-modal-backdrop" onclick="cerrarTalleModal()"></div>
        <div class="talle-modal-box">
          <button class="talle-modal-close" onclick="cerrarTalleModal()">×</button>
          <p class="talle-modal-eyebrow">Seleccioná tu talle</p>
          <h3 class="talle-modal-nombre"></h3>
          <div class="talle-modal-grid"></div>
          <div class="talle-confirm-wrap">
            <p class="talle-modal-nota">¿Dudas? <span onclick="cerrarTalleModal()">Ver guía de talles</span></p>
          </div>
        </div>`;
      document.body.appendChild(modal);

      const style = document.createElement('style');
      style.textContent = `
        #talleModal { position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center; }
        .talle-modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.8); backdrop-filter:blur(4px); }
        .talle-modal-box {
          position:relative; z-index:1; background:#131310; border:1px solid rgba(255,255,255,.1);
          padding:32px 28px; width:min(400px,94vw); animation:talleIn .3s cubic-bezier(.16,1,.3,1);
        }
        @keyframes talleIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        .talle-modal-close {
          position:absolute; top:12px; right:14px; background:none; border:1px solid rgba(255,255,255,.1);
          color:#ede9e1; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:16px;
          display:grid; place-items:center; transition:border-color .2s;
        }
        .talle-modal-close:hover { border-color:#c9a96e; color:#c9a96e; }
        .talle-modal-eyebrow { font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:#c9a96e; margin-bottom:8px; }
        .talle-modal-nombre { font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; font-weight:400; color:#ede9e1; margin-bottom:24px; }
        .talle-modal-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }

        /* Botón de talle con stock badge */
        .talle-btn {
          position:relative;
          padding:10px 18px 14px; border:1px solid rgba(255,255,255,.12); background:none;
          color:#ede9e1; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
          letter-spacing:.08em; cursor:pointer; transition:all .2s; min-width:56px; text-align:center;
        }
        .talle-btn:hover:not(.agotado) { border-color:#c9a96e; color:#c9a96e; background:rgba(201,169,110,.06); }
        .talle-btn.selected { background:#c9a96e; border-color:#c9a96e; color:#0b0b09; }
        .talle-btn.selected .talle-stock-badge { background:rgba(0,0,0,.2); color:#0b0b09; }
        .talle-btn.agotado { opacity:.3; cursor:not-allowed; text-decoration:line-through; }
        .talle-btn.stock-low { border-color:rgba(224,123,57,.5); }
        .talle-btn.stock-low:not(.selected) { color:#e07b39; }

        /* Badge de stock dentro del botón */
        .talle-stock-badge {
          position:absolute; bottom:3px; left:50%; transform:translateX(-50%);
          font-size:8px; font-weight:700; letter-spacing:.04em; white-space:nowrap;
          color:#6b6760; line-height:1;
        }
        .talle-stock-badge.stock-ok { color:#4db87a; }
        .talle-stock-badge.stock-low { color:#e07b39; }
        .talle-stock-badge.stock-out { color:#c0392b; }

        .talle-confirm-wrap { display:flex; flex-direction:column; gap:12px; }
        .talle-modal-nota { font-size:11px; color:#6b6760; }
        .talle-modal-nota span { color:#c9a96e; cursor:pointer; text-decoration:underline; }
        .talle-confirm-btn {
          width:100%; padding:14px; background:#c9a96e; color:#0b0b09; border:none;
          font-family:'DM Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; cursor:pointer; transition:background .2s; display:none;
        }
        .talle-confirm-btn.visible { display:block; }
        .talle-confirm-btn:hover { background:#a07e48; }
      `;
      document.head.appendChild(style);
    }

    let talleSeleccionado = null;
    modal.querySelector('.talle-modal-nombre').textContent = nombre;
    const grid = modal.querySelector('.talle-modal-grid');
    grid.innerHTML = '';

    // Limpiar confirm btn viejo
    let confirmBtn = modal.querySelector('.talle-confirm-btn');
    if (confirmBtn) confirmBtn.remove();
    confirmBtn = document.createElement('button');
    confirmBtn.className = 'talle-confirm-btn';
    confirmBtn.textContent = 'Agregar al carrito';
    confirmBtn.onclick = () => {
      if (!talleSeleccionado) return;
      cerrarTalleModal();
      agregarAlCarrito(id, nombre, precio, imagen, talleSeleccionado, '');
    };

    talles.forEach(t => {
      const nombre_t = typeof t === 'object' ? t.nombre : t;
      const agotado  = t.agotado === true || (typeof t === 'object' && t.stock === 0);
      const stock    = typeof t === 'object' && t.stock !== undefined ? t.stock : null;

      const btn = document.createElement('button');
      let cls = 'talle-btn';
      if (agotado) cls += ' agotado';
      else if (stock !== null && stock <= 3) cls += ' stock-low';
      btn.className = cls;
      btn.innerHTML = `<span class="talle-name">${nombre_t}</span>`;

      // Badge de stock
      if (stock !== null) {
        const badge = document.createElement('span');
        badge.className = 'talle-stock-badge';
        if (agotado || stock === 0) {
          badge.textContent = 'Agotado';
          badge.className += ' stock-out';
        } else if (stock <= 3) {
          badge.textContent = `¡Últimas ${stock}!`;
          badge.className += ' stock-low';
        } else if (stock <= 10) {
          badge.textContent = `${stock} disp.`;
          badge.className += ' stock-ok';
        }
        btn.appendChild(badge);
      }

      btn.onclick = () => {
        if (agotado) return;
        grid.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        talleSeleccionado = nombre_t;
        confirmBtn.classList.add('visible');

        // Actualizar texto del confirm con el talle
        const stockText = (stock !== null && stock <= 3 && !agotado)
          ? ` · Solo quedan ${stock}` : '';
        confirmBtn.textContent = `Agregar al carrito — ${nombre_t}${stockText}`;
      };
      grid.appendChild(btn);
    });

    const wrap = modal.querySelector('.talle-confirm-wrap');
    wrap.insertBefore(confirmBtn, wrap.firstChild);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.cerrarTalleModal = function () {
    const modal = document.getElementById('talleModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  /* ─── AGREGAR AL CARRITO ─── */
  window.agregarAlCarrito = function (id, nombre, precio, imagen, talle, color) {
    const cart = getCart();
    precio = parseFloat(precio) || 0;
    const key      = id + (talle ? '-' + talle : '') + (color ? '-' + color : '');
    const existing = cart.find(i => i.id === key);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id: key, nombre, precio, imagen: imagen || '', talle: talle || '', color: color || '', qty: 1 });
    }
    saveCart(cart);
    renderCart();
    mostrarNotificacion(nombre, talle);
  };

  /* ─── CANTIDAD ─── */
  window.cambiarCantidad = function (id, delta) {
    const cart = getCart();
    const item  = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, (item.qty || 1) + delta);
    if (item.qty === 0) cart.splice(cart.indexOf(item), 1);
    saveCart(cart);
    renderCart();
  };

  /* ─── ELIMINAR ─── */
  window.eliminarItem = function (id) {
    saveCart(getCart().filter(i => i.id !== id));
    renderCart();
  };

  /* ─── TOAST ─── */
  function mostrarNotificacion(nombre, talle) {
    const notif = getEls().notif;
    if (!notif) return;

    const span = notif.querySelector('.notif-text') || notif.querySelector('span');
    const talleStr = talle ? ` · Talle ${talle}` : '';
    if (span) span.textContent = `${nombre}${talleStr} agregado`;

    notif.classList.add('show');
    clearTimeout(notif._t);
    notif.style.cursor = 'pointer';
    notif.onclick = () => { notif.classList.remove('show'); toggleCart(); };
    notif._t = setTimeout(() => notif.classList.remove('show'), 4000);
  }

  /* ─── PAGAR WHATSAPP ─── */
  window.pagarWA = function () {
    const cart = getCart();
    if (!cart.length) return;
    const lineas = cart.map(i => {
      const q      = i.qty || 1;
      const talle  = i.talle ? ` · Talle: ${i.talle}` : '';
      const color  = i.color ? ` · Color: ${i.color}` : '';
      return `• ${i.nombre}${talle}${color}${q > 1 ? ' x' + q : ''} — $${((i.precio||0)*q).toLocaleString('es-AR')}`;
    }).join('%0A');
    const total = cart.reduce((s, i) => s + (i.precio||0)*(i.qty||1), 0);
    const msg   = `Hola! Quiero realizar el siguiente pedido:%0A%0A${lineas}%0A%0A*Total: $${total.toLocaleString('es-AR')}*%0A%0A¿Cómo continúo con la compra?`;
    window.open(`https://wa.me/5493525614281?text=${msg}`, '_blank');
  };

  /* ─── PAGAR MERCADO PAGO ─── */
  window.pagarMP = function () {
    if (!getCart().length) return;
    window.open('https://link.mercadopago.com.ar/baraandco', '_blank');
  };

  /* ─── HEADER SCROLL ─── */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function () {
    renderCart();
  });

})();
