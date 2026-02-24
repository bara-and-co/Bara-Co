/**
 * carrito.js — Bara & Co Dark Luxury
 */

(function(){

const CART_KEY = "bc_cart";

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

window.agregarAlCarrito = function(id,nombre,precio,imagen,talle='',color=''){

  const cart = getCart();
  const uniqueId = `${id}-${talle}-${color}`;
  const existing = cart.find(p=>p.id===uniqueId);

  if(existing){
    existing.qty++;
  }else{
    cart.push({
      id:uniqueId,
      nombre,
      precio:parseFloat(precio),
      imagen,
      talle,
      color,
      qty:1
    });
  }

  saveCart(cart);
  alert("Producto agregado al carrito 🖤");
}

window.irAlCheckout = function(){
  if(!getCart().length){
    alert("Tu carrito está vacío.");
    return;
  }
  window.location.href = "checkout.html";
};

})();
