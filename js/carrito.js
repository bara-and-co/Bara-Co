/**
 * carrito.js — Bara & Co v5 PRO
 */

(function () {

  const CART_KEY = 'bc_cart';
  const ENVIO_FREE = 80000;
  const WA_NUMBER = '5493525614281';

  /* ═════════════════ STORAGE ═════════════════ */

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /* ═════════════════ RENDER CARRITO ═════════════════ */

  function renderCart() {

    const cart = getCart();
    const totalQty = cart.reduce((s,i)=>s+i.qty,0);
    const subtotal = cart.reduce((s,i)=>s+i.precio*i.qty,0);

    document.querySelectorAll('.cart-count').forEach(b=>{
      b.textContent = totalQty;
      b.style.display = totalQty ? 'inline-block' : 'none';
    });

    const wrap = document.querySelector('.cart-items-wrap');
    const footer = document.querySelector('.cart-footer');
    if (!wrap) return;

    wrap.innerHTML = '';

    if (!cart.length) {
      wrap.innerHTML = `
        <div class="cart-empty">
          <p>Tu carrito está vacío</p>
        </div>
      `;
      if (footer) footer.innerHTML = '';
      return;
    }

    cart.forEach(item => {

      const el = document.createElement('div');
      el.className = 'cart-item';

      el.innerHTML = `
        <div class="ci-img">
          <img src="${item.imagen}" alt="${item.nombre}">
        </div>
        <div class="ci-info">
          <div class="ci-name">${item.nombre}</div>
          ${item.talle ? `<div class="ci-meta">Talle: ${item.talle}</div>`:''}
          ${item.color ? `<div class="ci-meta">Color: ${item.color}</div>`:''}
          <div class="ci-controls">
            <button onclick="cambiarCantidad('${item.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="cambiarCantidad('${item.id}',1)">+</button>
            <button onclick="eliminarItem('${item.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div class="ci-price">
            $${(item.precio*item.qty).toLocaleString('es-AR')}
          </div>
        </div>
      `;

      wrap.appendChild(el);
    });

    if (footer) {

      const falta = Math.max(0, ENVIO_FREE - subtotal);
      const progreso = Math.min(100, subtotal / ENVIO_FREE * 100);

      footer.innerHTML = `
        <div class="cart-shipping">
          ${
            falta>0
            ? `Te faltan <strong>$${falta.toLocaleString('es-AR')}</strong> para envío gratis`
            : `🎉 ¡Tenés envío gratis!`
          }
          <div class="progress">
            <div class="bar" style="width:${progreso}%"></div>
          </div>
        </div>

        <div class="cart-total">
          <span>Total</span>
          <strong>$${subtotal.toLocaleString('es-AR')}</strong>
        </div>

        <button onclick="pagarWA()" class="btn-wa">
          Confirmar por WhatsApp
        </button>

        <button onclick="pagarMP()" class="btn-mp">
          Pagar con Mercado Pago
        </button>
      `;
    }
  }

  /* ═════════════════ OPERACIONES ═════════════════ */

  window.agregarAlCarrito = function(id,nombre,precio,imagen,talle='',color=''){

    const cart = getCart();
    precio = parseFloat(precio)||0;

    const uniqueId = `${id}-${talle}-${color}`;
    const existing = cart.find(i=>i.id===uniqueId);

    if(existing){
      existing.qty++;
    }else{
      cart.push({
        id:uniqueId,
        nombre,
        precio,
        imagen,
        talle,
        color,
        qty:1
      });
    }

    saveCart(cart);
    renderCart();
  };

  window.cambiarCantidad = function(id,delta){

    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(!item) return;

    item.qty+=delta;

    if(item.qty<=0){
      const index = cart.indexOf(item);
      cart.splice(index,1);
    }

    saveCart(cart);
    renderCart();
  };

  window.eliminarItem = function(id){
    saveCart(getCart().filter(i=>i.id!==id));
    renderCart();
  };

  /* ═════════════════ PAGOS ═════════════════ */

  window.pagarWA = function(){

    const cart = getCart();
    if(!cart.length) return;

    const lineas = cart.map(i=>
      `• ${i.nombre}${i.talle?` · Talle ${i.talle}`:''}${i.color?` · Color ${i.color}`:''} x${i.qty} — $${(i.precio*i.qty).toLocaleString('es-AR')}`
    ).join('\n');

    const total = cart.reduce((s,i)=>s+i.precio*i.qty,0);

    const mensaje =
`Hola! Quiero hacer este pedido:

${lineas}

Total: $${total.toLocaleString('es-AR')}`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`,'_blank');
  };

  window.pagarMP = function(){
    if(!getCart().length) return;
    if(typeof mpCheckout !== 'undefined'){
      mpCheckout.abrirCheckout(getCart());
    }else{
      alert('Mercado Pago no está disponible.');
    }
  };

  document.addEventListener('DOMContentLoaded',renderCart);

})();
