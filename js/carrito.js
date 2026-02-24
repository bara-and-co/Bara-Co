/**
 * carrito.js — Bara & Co
 * Sistema de carrito unificado.
 * Mejoras UX: toast sin auto-abrir, selector talle, barra envío gratis, checkout claro.
 */

(function () {
  const CART_KEY    = 'bc_cart';
  const ENVIO_FREE  = 80000; // umbral envío gratis

  /* ─── HELPERS ─── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ─── DETECCIÓN DE ELEMENTOS ─── */
  function getEls() {
    return {
      panel:   document.querySelector('.cart-panel'),
      overlay: document.querySelector('.overlay'),
      items:   document.querySelector('.cart-items'),
      empty:   document.querySelector('.cart-empty'),
      footer:  document.querySelector('.cart-footer'),
      badges:  document.querySelectorAll('.cart-count, .cart-badge'),
      notif:   document.getElementById('cartNotification') || document.querySelector('.cart-notification'),
    };
  }

  /* ─── TOGGLE ─── */
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

  /* ─── RENDER ─── */
  function renderCart() {
    const cart    = getCart();
    const { items, empty, footer, badges } = getEls();
    const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const subtotal = cart.reduce((s, i) => s + (i.precio || 0) * (i.qty || 1), 0);

    // Badges
    badges.forEach(el => {
      el.textContent = totalQty;
      if (el.classList.contains('cart-badge')) el.classList.toggle('on', totalQty > 0);
    });

    if (!items) return;

    // Limpiar items viejos
    items.querySelectorAll('.cart-item').forEach(e => e.remove());

    // Vacío
    if (empty) empty.style.display = cart.length ? 'none' : 'block';

    // Items
    cart.forEach(item => {
      const nombre = item.nombre || 'Producto';
      const precio = item.precio || 0;
      const imagen = item.imagen || '';
      const qty    = item.qty || 1;
      const id     = item.id || nombre;
      const extras = [item.talle && `Talle: ${item.talle}`, item.color && `Color: ${item.color}`]
                       .filter(Boolean).join(' · ');

      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="item-image">
          <img src="${imagen}" alt="${nombre}" onerror="this.style.display='none'"/>
        </div>
        <div class="item-details">
          <h4>${nombre}</h4>
          ${extras ? `<p class="item-extras">${extras}</p>` : ''}
          <div class="item-price">$${(precio * qty).toLocaleString('es-AR')}</div>
          <div class="item-actions">
            <div class="item-quantity">
              <button class="qty-btn" onclick="cambiarCantidad('${id}', -1)" aria-label="Menos">−</button>
              <span class="quantity">${qty}</span>
              <button class="qty-btn" onclick="cambiarCantidad('${id}', 1)" aria-label="Más">+</button>
            </div>
            <button class="remove-item" onclick="eliminarItem('${id}')" aria-label="Eliminar">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>`;
      items.appendChild(el);
    });

    // Footer
    if (footer) {
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
        <div class="shipping-progress-wrap">
          <p class="shipping-progress-msg">${envioMsg}</p>
          <div class="shipping-progress-bar"><div style="width:${progreso}%"></div></div>
        </div>
        <div class="subtotal">
          <span>Subtotal</span>
          <span>$${subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div class="cart-checkout-btns">
          <button class="pay-btn pay-mp" onclick="pagarMP()">
            <i class="fas fa-credit-card"></i> Pagar con Mercado Pago
          </button>
          <button class="pay-btn pay-wa" onclick="pagarWA()">
            <i class="fab fa-whatsapp"></i> Confirmar por WhatsApp
          </button>
        </div>
        <p class="pay-note"><i class="fas fa-lock"></i> Pago 100% seguro · Hasta 6 cuotas sin interés</p>`;
    }
  }

  /* ─── MODAL SELECTOR DE TALLE ─── */
  window.mostrarSelectorTalle = function (id, nombre, precio, imagen, talles, stockTalles, stockMap) {
    // Si no hay talles definidos, agregar directo
    if (!talles || talles.length === 0) {
      agregarAlCarrito(id, nombre, precio, imagen, '', '');
      return;
    }

    // Helper: stock de un talle específico
    function getStockTalle(talleNombre) {
      if (stockTalles && stockTalles[talleNombre] !== undefined) return parseInt(stockTalles[talleNombre]) || 0;
      if (stockMap) {
        const keysForTalle = Object.entries(stockMap).filter(([k]) => k.endsWith('__' + talleNombre));
        if (keysForTalle.length) return keysForTalle.reduce((a, [, v]) => a + (parseInt(v) || 0), 0);
      }
      return null;
    }

    // Crear modal
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
          <p class="talle-modal-nota">¿Dudas? <a onclick="cerrarTalleModal()">Ver guía de talles</a></p>
        </div>`;
      document.body.appendChild(modal);

      // Estilos del modal
      const style = document.createElement('style');
      style.textContent = `
        #talleModal { position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center; }
        .talle-modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(4px); }
        .talle-modal-box {
          position:relative; z-index:1; background:#131310; border:1px solid rgba(255,255,255,.08);
          padding:32px 28px; width:min(380px,90vw); animation:talleIn .3s cubic-bezier(.16,1,.3,1);
        }
        @keyframes talleIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .talle-modal-close {
          position:absolute; top:12px; right:14px; background:none; border:1px solid rgba(255,255,255,.1);
          color:#ede9e1; width:28px; height:28px; border-radius:50%; cursor:pointer; font-size:16px;
          display:grid; place-items:center; transition:border-color .2s;
        }
        .talle-modal-close:hover { border-color:#c9a96e; color:#c9a96e; }
        .talle-modal-eyebrow { font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:#c9a96e; margin-bottom:8px; }
        .talle-modal-nombre { font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; font-weight:400; color:#ede9e1; margin-bottom:24px; }
        .talle-modal-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
        .talle-btn {
          padding:10px 18px; border:1px solid rgba(255,255,255,.12); background:none;
          color:#ede9e1; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
          letter-spacing:.08em; cursor:pointer; transition:all .2s; min-width:52px; text-align:center;
        }
        .talle-btn:hover { border-color:#c9a96e; color:#c9a96e; background:rgba(201,169,110,.06); }
        .talle-btn.selected { background:#c9a96e; border-color:#c9a96e; color:#0b0b09; }
        .talle-btn.agotado { opacity:.35; cursor:not-allowed; text-decoration:line-through; }
        .talle-modal-nota { font-size:11px; color:#6b6760; }
        .talle-modal-nota a { color:#c9a96e; cursor:pointer; text-decoration:underline; }
        .talle-confirm-btn {
          width:100%; padding:13px; background:#c9a96e; color:#0b0b09; border:none;
          font-family:'DM Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; cursor:pointer; margin-bottom:12px; transition:background .2s;
          display:none;
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

    // Quitar confirm viejo si existe
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
      const talleNombre = t.nombre || t;
      const stockT = getStockTalle(talleNombre);
      const sinStock = t.agotado || (stockT !== null && stockT === 0);

      const btn = document.createElement('button');
      btn.className = 'talle-btn' + (sinStock ? ' agotado' : '');

      let html = `<span>${talleNombre}</span>`;
      if (sinStock) {
        html += `<span style="display:block;font-size:8px;color:#888;margin-top:2px;">Agotado</span>`;
      } else if (stockT !== null && stockT > 0 && stockT <= 5) {
        html += `<span style="display:block;font-size:9px;color:#e07b39;font-weight:700;margin-top:2px;">·${stockT} ud.</span>`;
      }
      btn.innerHTML = html;
      btn.style.flexDirection = 'column';
      btn.style.lineHeight = '1.2';

      btn.onclick = () => {
        if (sinStock) return;
        grid.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        talleSeleccionado = talleNombre;
        confirmBtn.classList.add('visible');
      };
      grid.appendChild(btn);
    });

    modal.querySelector('.talle-modal-box').insertBefore(confirmBtn, modal.querySelector('.talle-modal-nota'));
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
    const key = id + (talle ? '-' + talle : '') + (color ? '-' + color : '');
    const existing = cart.find(i => i.id === key);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ id: key, nombre, precio, imagen: imagen || '', talle: talle || '', color: color || '', qty: 1 });
    }
    saveCart(cart);
    renderCart();
    mostrarNotificacion(nombre, talle);
    // NO abre el panel automáticamente — el toast es suficiente feedback
  };

  /* ─── CANTIDAD ─── */
  window.cambiarCantidad = function (id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
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

  /* ─── TOAST NOTIFICACIÓN ─── */
  function mostrarNotificacion(nombre, talle) {
    const notif = getEls().notif;
    if (!notif) return;
    const span = notif.querySelector('span');
    const talleStr = talle ? ` · Talle ${talle}` : '';
    if (span) span.textContent = `${nombre}${talleStr} agregado`;

    notif.classList.add('show');
    clearTimeout(notif._t);

    // Click en el toast abre el carrito
    notif.style.cursor = 'pointer';
    notif.onclick = () => { notif.classList.remove('show'); toggleCart(); };

    notif._t = setTimeout(() => notif.classList.remove('show'), 4000);
  }

  /* ─── PAGAR WHATSAPP ─── */
  window.pagarWA = function () {
    const cart = getCart();
    if (!cart.length) return;
    const lineas = cart.map(i => {
      const q = i.qty || 1;
      const talle = i.talle ? ` · Talle: ${i.talle}` : '';
      const color = i.color ? ` · Color: ${i.color}` : '';
      return `• ${i.nombre}${talle}${color}${q > 1 ? ' x' + q : ''} — $${((i.precio||0)*q).toLocaleString('es-AR')}`;
    }).join('%0A');
    const total = cart.reduce((s, i) => s + (i.precio||0)*(i.qty||1), 0);
    const msg = `Hola! Quiero realizar el siguiente pedido:%0A%0A${lineas}%0A%0A*Total: $${total.toLocaleString('es-AR')}*%0A%0A¿Cómo continúo con la compra?`;
    window.open(`https://wa.me/5493525614281?text=${msg}`, '_blank');
  };

  /* ─── PAGAR MERCADO PAGO ─── */
  window.pagarMP = function () {
    const cart = getCart();
    if (!cart.length) { return; }
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
