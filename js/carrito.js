/**
 * carrito.js — Bara & Co  v3
 * ─────────────────────────────────────────────────────────────
 * Sistema UNIVERSAL de carrito.
 * Funciona en: index.html · tienda.html · producto.html · contacto.html
 * y cualquier página futura que incluya este script.
 *
 * Estructura del item en localStorage (bc_cart):
 *   { id, nombre, precio, imagen, talle, color, qty }
 *
 * El script detecta automáticamente qué estructura HTML tiene
 * la página y renderiza el carrito en consecuencia.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  const CART_KEY   = 'bc_cart';
  const ENVIO_FREE = 80000;

  /* ═══════════════════════════════
     1. STORAGE
  ════════════════════════════════ */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ═══════════════════════════════
     2. DETECCIÓN DE ESTRUCTURA HTML
     Soporta dos variantes:
     A) producto.html / tienda.html → #cartPanel + .cart-items-wrap + .cart-footer
     B) contacto.html / index.html  → #cartDrawer + #cdBody + .cd-foot
  ════════════════════════════════ */
  function getEls() {
    const panel =
      document.getElementById('cartPanel') ||
      document.querySelector('.cart-panel') ||
      document.getElementById('cartDrawer');

    const overlay =
      document.getElementById('overlay')    ||
      document.querySelector('.overlay')    ||
      document.getElementById('cartBackdrop') ||
      document.querySelector('.cart-backdrop');

    const itemsWrap =
      document.querySelector('.cart-items-wrap') ||
      document.querySelector('.cart-items')      ||
      document.getElementById('cdBody');

    const emptyEl =
      document.querySelector('.cart-empty') ||
      document.getElementById('cdEmpty');

    const footer =
      document.getElementById('cartFooter')  ||
      document.querySelector('.cart-footer') ||
      document.querySelector('.cd-foot');

    const badges = document.querySelectorAll(
      '.cart-count, .cart-badge, #cartBadge, .cart-item-count'
    );

    const notif =
      document.getElementById('cartNotification') ||
      document.querySelector('.cart-notification');

    return { panel, overlay, itemsWrap, emptyEl, footer, badges, notif };
  }

  /* ═══════════════════════════════
     3. TOGGLE PANEL / DRAWER
  ════════════════════════════════ */
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

  /* ═══════════════════════════════
     4. RENDER PRINCIPAL
  ════════════════════════════════ */
  function renderCart() {
    const cart     = getCart();
    const { itemsWrap, emptyEl, footer, badges } = getEls();
    const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const subtotal = cart.reduce((s, i) => s + (i.precio || i.price || 0) * (i.qty || 1), 0);

    /* Badges del header */
    badges.forEach(el => {
      el.textContent = totalQty;
      el.classList.toggle('on', totalQty > 0);
    });

    if (!itemsWrap) return;

    /* Limpiar items previos (ambas clases) */
    itemsWrap.querySelectorAll('.cart-item, .cd-item').forEach(e => e.remove());

    /* Estado vacío */
    if (emptyEl) emptyEl.style.display = cart.length ? 'none' : '';

    /* Detectar variante: drawer (contacto) vs panel (producto/tienda) */
    const isDrawer = !!document.getElementById('cartDrawer') && !document.getElementById('cartPanel');

    if (isDrawer) {
      renderDrawerItems(cart, itemsWrap, subtotal, footer);
    } else {
      renderPanelItems(cart, itemsWrap, subtotal, footer);
    }
  }

  /* ─── Items para Panel (producto.html / tienda.html) ─── */
  function renderPanelItems(cart, wrap, subtotal, footer) {
    cart.forEach(item => {
      const nombre = item.nombre || item.name || 'Producto';
      const precio = item.precio || item.price || 0;
      const imagen = item.imagen || item.img || '';
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
      wrap.appendChild(el);
    });

    /* Footer */
    if (!footer) return;
    if (cart.length === 0) { footer.innerHTML = ''; return; }

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

  /* ─── Items para Drawer (contacto.html / index.html) ─── */
  function renderDrawerItems(cart, body, subtotal, footer) {
    cart.forEach(item => {
      const nombre = item.nombre || item.name || 'Producto';
      const precio = item.precio || item.price || 0;
      const imagen = item.imagen || item.img || '';
      const qty    = item.qty || 1;
      const id     = item.id || nombre;
      const talle  = item.talle ? `Talle: ${item.talle}` : '';

      const el = document.createElement('div');
      el.className = 'cd-item';
      el.innerHTML = `
        <img class="cd-item-img" src="${imagen}" alt="${nombre}" onerror="this.style.display='none'"/>
        <div style="flex:1;min-width:0">
          <div class="cd-item-name">${nombre}</div>
          ${talle ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${talle}</div>` : ''}
          <div class="cd-item-price">$${(precio * qty).toLocaleString('es-AR')}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <button onclick="cambiarCantidad('${id}',-1)" style="background:none;border:1px solid rgba(255,255,255,.12);color:var(--muted);width:24px;height:24px;cursor:pointer;font-size:15px;display:grid;place-items:center;transition:color .2s">−</button>
            <span style="font-size:13px;min-width:18px;text-align:center">${qty}</span>
            <button onclick="cambiarCantidad('${id}',1)" style="background:none;border:1px solid rgba(255,255,255,.12);color:var(--muted);width:24px;height:24px;cursor:pointer;font-size:15px;display:grid;place-items:center;transition:color .2s">+</button>
          </div>
        </div>
        <button class="cd-item-rm" onclick="eliminarItem('${id}')">×</button>`;
      body.appendChild(el);
    });

    /* Actualizar total en footer existente del drawer */
    if (footer) {
      const totalEl = document.getElementById('cdTotal') || footer.querySelector('.cd-total');
      if (totalEl) totalEl.textContent = '$' + subtotal.toLocaleString('es-AR');

      /* Barra de envío gratis (insertar si no existe) */
      let shippingBar = footer.querySelector('.cd-shipping');
      if (!shippingBar) {
        shippingBar = document.createElement('div');
        shippingBar.className = 'cd-shipping';
        shippingBar.style.cssText = 'margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)';
        footer.insertBefore(shippingBar, footer.firstChild);
      }
      if (cart.length === 0) {
        shippingBar.innerHTML = '';
      } else {
        const falta    = Math.max(0, ENVIO_FREE - subtotal);
        const progreso = Math.min(100, (subtotal / ENVIO_FREE) * 100);
        const msg      = falta > 0
          ? `Te faltan <strong style="color:var(--text)">$${falta.toLocaleString('es-AR')}</strong> para envío gratis 🚚`
          : `🎉 <strong>¡Tenés envío gratis!</strong>`;
        shippingBar.innerHTML = `
          <p style="font-size:12px;color:var(--muted);margin-bottom:7px">${msg}</p>
          <div style="height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden">
            <div style="width:${progreso}%;height:100%;background:var(--accent);border-radius:2px;transition:width .5s ease"></div>
          </div>`;
      }
    }
  }

  /* ═══════════════════════════════
     5. MODAL SELECTOR DE TALLE
  ════════════════════════════════ */
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
        <div class="tm-backdrop" onclick="cerrarTalleModal()"></div>
        <div class="tm-box">
          <button class="tm-close" onclick="cerrarTalleModal()">×</button>
          <p class="tm-eyebrow">Seleccioná tu talle</p>
          <h3 class="tm-nombre"></h3>
          <div class="tm-grid"></div>
          <div class="tm-actions">
            <p class="tm-nota">¿Dudas? <span onclick="cerrarTalleModal()">Ver guía de talles</span></p>
          </div>
        </div>`;
      document.body.appendChild(modal);
      const s = document.createElement('style');
      s.textContent = `
        #talleModal{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center}
        .tm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(4px)}
        .tm-box{position:relative;z-index:1;background:#131310;border:1px solid rgba(255,255,255,.1);
          padding:32px 28px;width:min(400px,94vw);animation:tmIn .3s cubic-bezier(.16,1,.3,1)}
        @keyframes tmIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .tm-close{position:absolute;top:12px;right:14px;background:none;border:1px solid rgba(255,255,255,.1);
          color:#ede9e1;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;
          display:grid;place-items:center;transition:border-color .2s}
        .tm-close:hover{border-color:#c9a96e;color:#c9a96e}
        .tm-eyebrow{font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:#c9a96e;margin-bottom:8px}
        .tm-nombre{font-family:'Cormorant Garamond','Playfair Display',Georgia,serif;font-size:20px;font-weight:400;color:#ede9e1;margin-bottom:22px}
        .tm-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
        .tm-btn{position:relative;padding:10px 18px 16px;border:1px solid rgba(255,255,255,.12);background:none;
          color:#ede9e1;font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;
          transition:all .2s;min-width:56px;text-align:center}
        .tm-btn:hover:not(.tm-agotado){border-color:#c9a96e;color:#c9a96e;background:rgba(201,169,110,.06)}
        .tm-btn.tm-selected{background:#c9a96e;border-color:#c9a96e;color:#0b0b09}
        .tm-btn.tm-selected .tm-stock{color:rgba(0,0,0,.5)}
        .tm-btn.tm-agotado{opacity:.28;cursor:not-allowed;text-decoration:line-through}
        .tm-btn.tm-low:not(.tm-selected){border-color:rgba(224,123,57,.5);color:#e07b39}
        .tm-stock{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);
          font-size:8px;font-weight:700;letter-spacing:.04em;white-space:nowrap;color:#6b6760}
        .tm-stock.s-ok{color:#4db87a} .tm-stock.s-low{color:#e07b39} .tm-stock.s-out{color:#c0392b}
        .tm-confirm{width:100%;padding:14px;background:#c9a96e;color:#0b0b09;border:none;
          font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;
          cursor:pointer;transition:background .2s;display:none;margin-bottom:12px}
        .tm-confirm.visible{display:block}
        .tm-confirm:hover{background:#a07e48}
        .tm-nota{font-size:11px;color:#6b6760}
        .tm-nota span{color:#c9a96e;cursor:pointer;text-decoration:underline}
      `;
      document.head.appendChild(s);
    }

    let talleSeleccionado = null;
    modal.querySelector('.tm-nombre').textContent = nombre;
    const grid = modal.querySelector('.tm-grid');
    grid.innerHTML = '';

    let confirmBtn = modal.querySelector('.tm-confirm');
    if (confirmBtn) confirmBtn.remove();
    confirmBtn = document.createElement('button');
    confirmBtn.className = 'tm-confirm';
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
      let cls = 'tm-btn';
      if (agotado) cls += ' tm-agotado';
      else if (stock !== null && stock <= 3) cls += ' tm-low';
      btn.className = cls;
      btn.innerHTML = `<span>${nombre_t}</span>`;

      if (stock !== null) {
        const badge = document.createElement('span');
        badge.className = 'tm-stock';
        if (agotado || stock === 0) { badge.textContent = 'Agotado'; badge.className += ' s-out'; }
        else if (stock <= 3)        { badge.textContent = `¡Últimas ${stock}!`; badge.className += ' s-low'; }
        else if (stock <= 10)       { badge.textContent = `${stock} disp.`; badge.className += ' s-ok'; }
        btn.appendChild(badge);
      }

      if (!agotado && stock !== 0) {
        btn.onclick = () => {
          grid.querySelectorAll('.tm-btn').forEach(b => b.classList.remove('tm-selected'));
          btn.classList.add('tm-selected');
          talleSeleccionado = nombre_t;
          const hint = (stock !== null && stock <= 3) ? ` · Solo quedan ${stock}` : '';
          confirmBtn.textContent = `Agregar — ${nombre_t}${hint}`;
          confirmBtn.classList.add('visible');
        };
      }
      grid.appendChild(btn);
    });

    modal.querySelector('.tm-actions').insertBefore(confirmBtn, modal.querySelector('.tm-nota'));
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.cerrarTalleModal = function () {
    const m = document.getElementById('talleModal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = '';
  };

  /* ═══════════════════════════════
     6. OPERACIONES DE CARRITO
  ════════════════════════════════ */
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
    mostrarToast(nombre, talle);
  };

  window.cambiarCantidad = function (id, delta) {
    const cart = getCart();
    const item  = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, (item.qty || 1) + delta);
    if (item.qty === 0) cart.splice(cart.indexOf(item), 1);
    saveCart(cart);
    renderCart();
  };

  window.eliminarItem = function (id) {
    saveCart(getCart().filter(i => i.id !== id));
    renderCart();
  };

  /* ═══════════════════════════════
     7. TOAST NOTIFICACIÓN
  ════════════════════════════════ */
  function mostrarToast(nombre, talle) {
    const notif = getEls().notif;
    if (!notif) return;
    const span = notif.querySelector('.notif-text') || notif.querySelector('span');
    if (span) span.textContent = `${nombre}${talle ? ' · Talle ' + talle : ''} agregado`;
    notif.classList.add('show');
    clearTimeout(notif._t);
    notif.style.cursor = 'pointer';
    notif.onclick = () => { notif.classList.remove('show'); toggleCart(); };
    notif._t = setTimeout(() => notif.classList.remove('show'), 4000);
  }

  /* ═══════════════════════════════
     8. PAGO
  ════════════════════════════════ */
  window.pagarWA = function () {
    const cart = getCart();
    if (!cart.length) return;
    const lineas = cart.map(i => {
      const q      = i.qty || 1;
      const nombre = i.nombre || i.name || 'Producto';
      const precio = i.precio || i.price || 0;
      const talle  = i.talle ? ` · Talle: ${i.talle}` : '';
      const color  = i.color ? ` · Color: ${i.color}` : '';
      return `• ${nombre}${talle}${color}${q > 1 ? ' x' + q : ''} — $${(precio * q).toLocaleString('es-AR')}`;
    }).join('%0A');
    const total = cart.reduce((s, i) => s + (i.precio || i.price || 0) * (i.qty || 1), 0);
    const msg = `Hola! Quiero realizar el siguiente pedido:%0A%0A${lineas}%0A%0A*Total: $${total.toLocaleString('es-AR')}*%0A%0A¿Cómo continúo?`;
    window.open(`https://wa.me/5493525614281?text=${msg}`, '_blank');
  };

  window.pagarMP = function () {
    if (!getCart().length) return;
    window.open('https://link.mercadopago.com.ar/baraandco', '_blank');
  };

  /* ═══════════════════════════════
     9. HEADER SCROLL
  ════════════════════════════════ */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ═══════════════════════════════
     10. SINCRONIZACIÓN ENTRE PESTAÑAS
  ════════════════════════════════ */
  window.addEventListener('storage', e => {
    if (e.key === CART_KEY) renderCart();
  });

  /* ═══════════════════════════════
     11. INIT
  ════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const { panel } = getEls();
        if (panel && panel.classList.contains('open')) toggleCart();
      }
    });
  });

})();
