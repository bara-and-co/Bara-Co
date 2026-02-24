/**
 * carrito-ui.js — Bara & Co Dark Luxury
 * ─────────────────────────────────────────────────────────────────────────────
 * Archivo autónomo: inyecta el drawer del carrito, sus estilos y toda su
 * lógica en cualquier página del sitio con un solo <script>.
 *
 * USO (pegar justo antes de </body> en cada HTML):
 *   <script src="js/carrito-ui.js"></script>
 *
 * El archivo también expone globalmente:
 *   window.agregarAlCarrito(id, nombre, precio, imagen, talle, color)
 *   window.toggleCart()
 *   window.irAlCheckout()
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     1. CONSTANTES
  ══════════════════════════════════════════════════════ */
  const CART_KEY     = 'bc_cart';
  const FREE_SHIP    = 80000;   // umbral envío gratis (ARS)
  const WA_NUMBER    = '5493525614281';

  /* ══════════════════════════════════════════════════════
     2. INYECTAR CSS
  ══════════════════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Variables (se re-declaran por si la página no las tiene) ── */
    :root {
      --bc-bg:      #0b0b09;
      --bc-surface: #131310;
      --bc-border:  rgba(255,255,255,.07);
      --bc-text:    #ede9e1;
      --bc-muted:   #6b6760;
      --bc-accent:  #c9a96e;
      --bc-adk:     #a07e48;
      --bc-serif:   'Cormorant Garamond', Georgia, serif;
      --bc-sans:    'DM Sans', sans-serif;
      --bc-ease:    cubic-bezier(.16,1,.3,1);
    }

    /* ── Overlay ── */
    #bcOverlay {
      position:fixed; inset:0;
      background:rgba(0,0,0,.72);
      z-index:1998;
      opacity:0; visibility:hidden;
      transition:opacity .3s var(--bc-ease), visibility .3s;
      backdrop-filter:blur(4px);
    }
    #bcOverlay.active { opacity:1; visibility:visible; }

    /* ── Panel ── */
    #bcPanel {
      position:fixed; top:0; right:-500px;
      width:min(420px,100%); height:100vh;
      background:var(--bc-surface);
      border-left:1px solid var(--bc-border);
      z-index:1999;
      transition:right .4s var(--bc-ease);
      display:flex; flex-direction:column;
      box-shadow:-5px 0 30px rgba(0,0,0,.5);
      font-family:var(--bc-sans);
      color:var(--bc-text);
    }
    #bcPanel.open { right:0; }

    /* Header */
    .bc-cart-header {
      padding:24px 22px 20px;
      border-bottom:1px solid var(--bc-border);
      display:flex; align-items:center; justify-content:space-between;
      flex-shrink:0;
    }
    .bc-cart-title {
      font-family:var(--bc-serif); font-size:22px; font-weight:400;
    }
    .bc-cart-title span {
      font-size:14px; color:var(--bc-muted); margin-left:6px;
    }
    .bc-close-btn {
      background:none; border:1px solid var(--bc-border);
      color:var(--bc-text); width:34px; height:34px; border-radius:50%;
      cursor:pointer; font-size:16px;
      transition:all .2s; display:grid; place-items:center;
    }
    .bc-close-btn:hover { border-color:var(--bc-accent); color:var(--bc-accent); }

    /* Items list */
    .bc-items-wrap {
      flex:1; overflow-y:auto; padding:12px 22px;
      scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.1) transparent;
    }
    .bc-items-wrap::-webkit-scrollbar { width:4px; }
    .bc-items-wrap::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:2px; }

    /* Empty state */
    .bc-empty {
      text-align:center; padding:60px 20px; color:var(--bc-muted);
    }
    .bc-empty i { font-size:44px; margin-bottom:16px; opacity:.35; display:block; }
    .bc-empty p { margin-bottom:20px; font-size:14px; }
    .bc-btn-browse {
      display:inline-block; padding:12px 24px;
      background:var(--bc-accent); color:var(--bc-bg);
      font-family:var(--bc-sans); font-size:11px; font-weight:600;
      letter-spacing:.1em; text-transform:uppercase;
      border:none; cursor:pointer; transition:background .2s;
      text-decoration:none;
    }
    .bc-btn-browse:hover { background:var(--bc-adk); }

    /* Single item */
    .bc-item {
      display:flex; gap:14px;
      padding:16px 0; border-bottom:1px solid var(--bc-border);
    }
    .bc-item:last-child { border-bottom:none; }
    .bc-item-img {
      width:76px; height:96px; flex-shrink:0;
      background:var(--bc-bg); overflow:hidden;
    }
    .bc-item-img img { width:100%; height:100%; object-fit:cover; }
    .bc-item-info { flex:1; min-width:0; }
    .bc-item-name {
      font-family:var(--bc-serif); font-size:15px;
      margin-bottom:3px; white-space:nowrap;
      overflow:hidden; text-overflow:ellipsis;
    }
    .bc-item-extras { font-size:11px; color:var(--bc-muted); margin-bottom:4px; }
    .bc-item-price  { font-size:14px; color:var(--bc-accent); margin-bottom:10px; }
    .bc-item-row    { display:flex; align-items:center; justify-content:space-between; }
    .bc-qty-wrap    {
      display:flex; align-items:center; gap:10px;
      background:var(--bc-bg); border-radius:20px; padding:3px 8px;
    }
    .bc-qty-btn {
      background:none; border:none; color:var(--bc-text);
      width:24px; height:24px; cursor:pointer; font-size:16px;
      transition:color .2s; line-height:1;
    }
    .bc-qty-btn:hover { color:var(--bc-accent); }
    .bc-qty-num { min-width:22px; text-align:center; font-size:14px; }
    .bc-remove-btn {
      background:none; border:none; color:var(--bc-muted);
      cursor:pointer; font-size:14px; transition:color .2s; padding:4px;
    }
    .bc-remove-btn:hover { color:#b83030; }

    /* Footer */
    .bc-cart-footer {
      border-top:1px solid var(--bc-border);
      padding:16px 22px 20px;
      flex-shrink:0;
    }
    .bc-ship-bar { margin-bottom:14px; }
    .bc-ship-msg { font-size:12px; color:var(--bc-muted); margin-bottom:8px; line-height:1.5; }
    .bc-ship-msg strong { color:var(--bc-accent); }
    .bc-ship-track { height:3px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
    .bc-ship-track div {
      height:100%; background:var(--bc-accent);
      border-radius:2px; transition:width .6s var(--bc-ease);
    }
    .bc-subtotal {
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:14px; font-size:15px;
    }
    .bc-subtotal-amount {
      font-family:var(--bc-serif); font-size:22px; color:var(--bc-accent);
    }
    .bc-btn-checkout {
      width:100%; padding:13px; border:none; cursor:pointer;
      font-family:var(--bc-sans); font-size:11px; font-weight:600;
      letter-spacing:.1em; text-transform:uppercase;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:all .2s; margin-bottom:8px;
      background:var(--bc-accent); color:var(--bc-bg);
    }
    .bc-btn-checkout:hover { background:var(--bc-adk); }
    .bc-btn-wa {
      width:100%; padding:13px; cursor:pointer;
      font-family:var(--bc-sans); font-size:11px; font-weight:600;
      letter-spacing:.1em; text-transform:uppercase;
      display:flex; align-items:center; justify-content:center; gap:8px;
      background:rgba(37,211,102,.08);
      border:1px solid rgba(37,211,102,.25); color:#25d366;
      transition:all .2s; margin-bottom:10px;
    }
    .bc-btn-wa:hover { background:rgba(37,211,102,.16); border-color:#25d366; }
    .bc-pay-note {
      text-align:center; font-size:11px; color:var(--bc-muted);
      display:flex; align-items:center; justify-content:center; gap:5px;
    }
    .bc-pay-note i { color:#4db87a; }

    /* ── Toast ── */
    #bcToast {
      position:fixed; bottom:90px; right:24px;
      background:var(--bc-surface);
      border-left:3px solid var(--bc-accent);
      color:var(--bc-text); padding:13px 20px;
      z-index:2100;
      display:flex; align-items:center; gap:10px;
      max-width:280px;
      transform:translateX(120%); opacity:0;
      transition:transform .4s var(--bc-ease), opacity .4s;
      box-shadow:0 4px 24px rgba(0,0,0,.35);
      font-family:var(--bc-sans); font-size:13px; cursor:pointer;
      border-radius:2px;
    }
    #bcToast.show { transform:translateX(0); opacity:1; }
    #bcToast i   { color:var(--bc-accent); flex-shrink:0; }
    #bcToast span { flex:1; line-height:1.4; }
    .bc-toast-cta {
      font-size:10px; letter-spacing:.1em; text-transform:uppercase;
      color:var(--bc-accent);
      border-bottom:1px solid rgba(201,169,110,.3); padding-bottom:1px;
      white-space:nowrap; flex-shrink:0;
    }

    /* ── Badge en header ── */
    .bc-badge {
      position:absolute; top:-6px; right:5px;
      width:16px; height:16px; border-radius:50%;
      background:var(--bc-accent); color:var(--bc-bg);
      font-size:8px; font-weight:700;
      display:none; place-items:center;
      font-family:var(--bc-sans);
    }
    .bc-badge.on { display:grid; }

    @media (max-width:480px) {
      #bcPanel { width:100%; }
    }
  `;
  document.head.appendChild(style);

  /* ══════════════════════════════════════════════════════
     3. INYECTAR HTML DEL DRAWER
  ══════════════════════════════════════════════════════ */
  const html = `
    <div id="bcOverlay" onclick="toggleCart()"></div>

    <div id="bcPanel" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <div class="bc-cart-header">
        <h2 class="bc-cart-title">
          Carrito <span id="bcCount">0</span>
        </h2>
        <button class="bc-close-btn" onclick="toggleCart()" aria-label="Cerrar carrito">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="bc-items-wrap" id="bcItemsWrap">
        <!-- se rellena por JS -->
      </div>

      <div class="bc-cart-footer" id="bcFooter" style="display:none">
        <div class="bc-ship-bar">
          <p class="bc-ship-msg" id="bcShipMsg"></p>
          <div class="bc-ship-track"><div id="bcShipBar" style="width:0%"></div></div>
        </div>
        <div class="bc-subtotal">
          <span>Subtotal</span>
          <span class="bc-subtotal-amount" id="bcTotal"></span>
        </div>
        <button class="bc-btn-checkout" onclick="irAlCheckout()">
          <i class="fas fa-lock"></i> Finalizar compra
        </button>
        <button class="bc-btn-wa" onclick="pedirPorWA()">
          <i class="fab fa-whatsapp" style="font-size:17px"></i> Pedir por WhatsApp
        </button>
        <p class="bc-pay-note">
          <i class="fas fa-shield-alt"></i> Pago seguro · Mercado Pago
        </p>
      </div>
    </div>

    <div id="bcToast" onclick="toggleCart()">
      <i class="fas fa-check-circle"></i>
      <span id="bcToastMsg">Producto agregado</span>
      <span class="bc-toast-cta">Ver carrito</span>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  /* ══════════════════════════════════════════════════════
     4. LÓGICA DEL CARRITO
  ══════════════════════════════════════════════════════ */

  /* ── Helpers localStorage ── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ── Formatear precio ── */
  function fmt(n) {
    return '$' + Number(n).toLocaleString('es-AR');
  }

  /* ── Renderizar drawer ── */
  function render() {
    const cart = getCart();
    const wrap    = document.getElementById('bcItemsWrap');
    const footer  = document.getElementById('bcFooter');
    const countEl = document.getElementById('bcCount');

    // Actualizar todos los badges en el header (cart-count, cart-badge, bcCount, etc.)
    const total = cart.reduce((s, i) => s + i.qty, 0);
    if (countEl) countEl.textContent = total;

    // Badges en el header de la página (clases usadas en tienda/producto/checkout)
    document.querySelectorAll('.cart-count, .cart-badge').forEach(el => {
      el.textContent = total;
      if (el.classList.contains('cart-badge')) {
        el.classList.toggle('on', total > 0);
      }
    });

    if (!cart.length) {
      wrap.innerHTML = `
        <div class="bc-empty">
          <i class="fas fa-shopping-bag"></i>
          <p>Tu carrito está vacío</p>
          <a href="tienda.html" class="bc-btn-browse" onclick="toggleCart()">Explorar productos</a>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    // Items
    wrap.innerHTML = cart.map(item => {
      const extras = [item.talle, item.color].filter(Boolean).join(' · ');
      return `
        <div class="bc-item">
          <div class="bc-item-img">
            <img src="${item.imagen || ''}" alt="${item.nombre}"
                 onerror="this.style.display='none'"/>
          </div>
          <div class="bc-item-info">
            <div class="bc-item-name">${item.nombre}</div>
            ${extras ? `<div class="bc-item-extras">${extras}</div>` : ''}
            <div class="bc-item-price">${fmt(item.precio * item.qty)}</div>
            <div class="bc-item-row">
              <div class="bc-qty-wrap">
                <button class="bc-qty-btn" onclick="bcChangeQty('${item.id}',-1)">−</button>
                <span class="bc-qty-num">${item.qty}</span>
                <button class="bc-qty-btn" onclick="bcChangeQty('${item.id}',1)">+</button>
              </div>
              <button class="bc-remove-btn" onclick="bcRemove('${item.id}')" aria-label="Eliminar">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Footer
    if (footer) {
      footer.style.display = 'block';
      const subtotal = cart.reduce((s, i) => s + i.precio * i.qty, 0);
      document.getElementById('bcTotal').textContent = fmt(subtotal);

      // Barra de envío gratis
      const falta = Math.max(0, FREE_SHIP - subtotal);
      const pct   = Math.min(100, (subtotal / FREE_SHIP) * 100);
      const msg   = falta === 0
        ? '🎉 ¡Tenés <strong>envío gratis</strong>!'
        : `Te faltan <strong>${fmt(falta)}</strong> para envío gratis`;
      document.getElementById('bcShipMsg').innerHTML = msg;
      document.getElementById('bcShipBar').style.width = pct + '%';
    }
  }

  /* ══════════════════════════════════════════════════════
     5. API PÚBLICA
  ══════════════════════════════════════════════════════ */

  /** Abrir / cerrar el drawer */
  window.toggleCart = function () {
    const panel   = document.getElementById('bcPanel');
    const overlay = document.getElementById('bcOverlay');
    const isOpen  = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    overlay.classList.toggle('active', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
    if (!isOpen) render(); // refrescar al abrir
  };

  /** Agregar producto al carrito */
  window.agregarAlCarrito = function (id, nombre, precio, imagen, talle = '', color = '') {
    const cart     = getCart();
    const uniqueId = `${id}-${talle}-${color}`;
    const existing = cart.find(p => p.id === uniqueId);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id: uniqueId,
        nombre,
        precio: parseFloat(precio),
        imagen,
        talle,
        color,
        qty: 1
      });
    }

    saveCart(cart);
    render();
    showToast(`${nombre}${talle ? ' – ' + talle : ''} agregado al carrito`);
  };

  /** Ir al checkout */
  window.irAlCheckout = function () {
    if (!getCart().length) {
      alert('Tu carrito está vacío.');
      return;
    }
    window.location.href = 'checkout.html';
  };

  /** Pedir por WhatsApp con detalle del carrito */
  window.pedirPorWA = function () {
    const cart = getCart();
    if (!cart.length) { alert('Tu carrito está vacío.'); return; }
    const items = cart.map(i => `• ${i.nombre}${i.talle ? ' (' + i.talle + ')' : ''} x${i.qty} — ${fmt(i.precio * i.qty)}`).join('\n');
    const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
    const msg = `Hola! Quiero hacer el siguiente pedido en Bara & Co:\n\n${items}\n\nTotal: ${fmt(total)}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ── Funciones internas (expuestas en window para los onclick del HTML) ── */
  window.bcChangeQty = function (id, delta) {
    const cart = getCart();
    const item = cart.find(p => p.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
    render();
  };

  window.bcRemove = function (id) {
    saveCart(getCart().filter(p => p.id !== id));
    render();
  };

  /* ══════════════════════════════════════════════════════
     6. TOAST
  ══════════════════════════════════════════════════════ */
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('bcToast');
    const msgEl = document.getElementById('bcToastMsg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
  }

  /* ══════════════════════════════════════════════════════
     7. RENDER INICIAL + ESCUCHAR CAMBIOS DE OTRAS PESTAÑAS
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('storage', function (e) {
    if (e.key === CART_KEY) render();
  });

  // Por si DOMContentLoaded ya pasó (script cargado con defer/async)
  if (document.readyState !== 'loading') render();

  /* ══════════════════════════════════════════════════════
     8. SELECTOR DE TALLE (usado en tienda.html)
        Muestra un modal liviano para elegir talle antes
        de agregar al carrito desde la grilla de productos.
  ══════════════════════════════════════════════════════ */

  // Inyectar estilos del modal
  const styleModal = document.createElement('style');
  styleModal.textContent = `
    #bcTalleBackdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.75);
      z-index:2200; opacity:0; visibility:hidden;
      transition:opacity .3s, visibility .3s;
      backdrop-filter:blur(6px);
    }
    #bcTalleBackdrop.open { opacity:1; visibility:visible; }
    #bcTalleModal {
      position:fixed; top:50%; left:50%; z-index:2201;
      width:min(420px,94vw);
      background:#131310; border:1px solid rgba(255,255,255,.08);
      padding:28px 24px 24px;
      transform:translate(-50%,-54%) scale(.97);
      opacity:0; visibility:hidden;
      transition:transform .35s cubic-bezier(.16,1,.3,1), opacity .3s, visibility .3s;
      box-shadow:0 20px 60px rgba(0,0,0,.6);
    }
    #bcTalleModal.open {
      transform:translate(-50%,-50%) scale(1);
      opacity:1; visibility:visible;
    }
    .bc-tm-header {
      display:flex; align-items:flex-start; justify-content:space-between;
      margin-bottom:18px; gap:12px;
    }
    .bc-tm-title {
      font-family:'Cormorant Garamond',Georgia,serif;
      font-size:20px; font-weight:300; line-height:1.15;
      color:#ede9e1;
    }
    .bc-tm-close {
      background:none; border:1px solid rgba(255,255,255,.1);
      color:#ede9e1; width:30px; height:30px; border-radius:50%;
      cursor:pointer; display:grid; place-items:center; font-size:14px;
      flex-shrink:0; transition:border-color .2s;
    }
    .bc-tm-close:hover { border-color:#c9a96e; color:#c9a96e; }
    .bc-tm-label {
      font-size:9px; letter-spacing:.18em; text-transform:uppercase;
      color:#6b6760; margin-bottom:10px;
    }
    .bc-tm-talles {
      display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px;
    }
    .bc-tm-btn {
      min-width:52px; padding:9px 14px;
      border:1px solid rgba(255,255,255,.1);
      background:none; color:#ede9e1;
      font-family:'DM Sans',sans-serif; font-size:12px;
      cursor:pointer; transition:all .2s; position:relative;
    }
    .bc-tm-btn:hover { border-color:#c9a96e; color:#c9a96e; }
    .bc-tm-btn.selected { background:#c9a96e; border-color:#c9a96e; color:#0b0b09; }
    .bc-tm-btn.disabled {
      opacity:.35; cursor:not-allowed; text-decoration:line-through;
    }
    .bc-tm-btn .bc-tm-stock {
      display:block; font-size:9px; margin-top:2px;
      color:#6b6760; line-height:1;
    }
    .bc-tm-btn.selected .bc-tm-stock { color:rgba(11,11,9,.55); }
    .bc-tm-add {
      width:100%; padding:13px; background:#c9a96e; border:none;
      color:#0b0b09; font-family:'DM Sans',sans-serif;
      font-size:10px; font-weight:700; letter-spacing:.18em;
      text-transform:uppercase; cursor:pointer; transition:background .2s;
      display:flex; align-items:center; justify-content:center; gap:8px;
    }
    .bc-tm-add:hover { background:#a07e48; }
    .bc-tm-err {
      font-size:11px; color:#e07b6a; margin-bottom:12px; display:none;
    }
    .bc-tm-err.show { display:block; }
  `;
  document.head.appendChild(styleModal);

  // Inyectar HTML del modal
  const modalHtml = `
    <div id="bcTalleBackdrop" onclick="bcCerrarTalle()"></div>
    <div id="bcTalleModal" role="dialog" aria-modal="true">
      <div class="bc-tm-header">
        <h3 class="bc-tm-title" id="bcTmNombre"></h3>
        <button class="bc-tm-close" onclick="bcCerrarTalle()">✕</button>
      </div>
      <p class="bc-tm-label">Elegí tu talle</p>
      <div class="bc-tm-talles" id="bcTmTalles"></div>
      <p class="bc-tm-err" id="bcTmErr">Seleccioná un talle para continuar</p>
      <button class="bc-tm-add" onclick="bcConfirmarTalle()">
        <i class="fas fa-shopping-bag"></i> Agregar al carrito
      </button>
    </div>
  `;
  const mw = document.createElement('div');
  mw.innerHTML = modalHtml;
  document.body.appendChild(mw);

  // Estado del modal
  let _tmData = null;
  let _tmSelected = null;

  window.mostrarSelectorTalle = function(id, nombre, precio, imagen, talles, stockTalles, stockMap) {
    _tmData = { id, nombre, precio, imagen, talles, stockTalles, stockMap };
    _tmSelected = null;

    document.getElementById('bcTmNombre').textContent = nombre;
    document.getElementById('bcTmErr').classList.remove('show');

    const container = document.getElementById('bcTmTalles');
    container.innerHTML = '';

    const tallesArr = Array.isArray(talles) ? talles : [];
    tallesArr.forEach(t => {
      const nombre_t = typeof t === 'object' ? (t.nombre || t.name || t) : t;
      // Determinar stock
      let stock = null;
      if (stockMap   && stockMap[nombre_t]   !== undefined) stock = parseInt(stockMap[nombre_t])   || 0;
      if (stockTalles && stockTalles[nombre_t] !== undefined) stock = parseInt(stockTalles[nombre_t]) || 0;

      const agotado = (stock !== null && stock === 0);
      const btn = document.createElement('button');
      btn.className = 'bc-tm-btn' + (agotado ? ' disabled' : '');
      btn.disabled = agotado;
      btn.innerHTML = `<span>${nombre_t}</span>`;

      if (stock !== null && !agotado && stock <= 3) {
        const s = document.createElement('span');
        s.className = 'bc-tm-stock';
        s.textContent = `¡Últimas ${stock}!`;
        btn.appendChild(s);
      } else if (agotado) {
        const s = document.createElement('span');
        s.className = 'bc-tm-stock';
        s.textContent = 'Agotado';
        btn.appendChild(s);
      }

      if (!agotado) {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.bc-tm-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          _tmSelected = nombre_t;
          document.getElementById('bcTmErr').classList.remove('show');
        });
      }
      container.appendChild(btn);
    });

    document.getElementById('bcTalleBackdrop').classList.add('open');
    document.getElementById('bcTalleModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.bcCerrarTalle = function() {
    document.getElementById('bcTalleBackdrop').classList.remove('open');
    document.getElementById('bcTalleModal').classList.remove('open');
    document.body.style.overflow = '';
    _tmData = null;
    _tmSelected = null;
  };

  window.bcConfirmarTalle = function() {
    if (!_tmData) return;
    if (!_tmSelected) {
      document.getElementById('bcTmErr').classList.add('show');
      return;
    }
    window.agregarAlCarrito(_tmData.id, _tmData.nombre, _tmData.precio, _tmData.imagen, _tmSelected, '');
    bcCerrarTalle();
  };

  // Cerrar con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') bcCerrarTalle();
  });

})();
