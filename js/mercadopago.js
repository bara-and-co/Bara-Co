/**
 * mercadopago.js — Bara & Co
 * Versión segura para Checkout Pro
 */

class MercadoPagoCheckout {

  constructor(){
    this.init();
  }

  init(){
    console.log('MercadoPago listo');
  }

  abrirCheckout(cart){

    if(!cart.length){
      alert('Tu carrito está vacío');
      return;
    }

    // ⚠️ IMPORTANTE:
    // Debes reemplazar este link por uno real generado en tu cuenta MP
    const CHECKOUT_LINK = "https://link.mercadopago.com.ar/baraandco";

    window.location.href = CHECKOUT_LINK;
  }
}

const mpCheckout = new MercadoPagoCheckout();
