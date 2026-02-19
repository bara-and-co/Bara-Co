// Configuración de MercadoPago
class MercadoPagoCheckout {
    constructor() {
        this.publicKey = 'APP_USR-xxxxxxxxxxxxx'; // Reemplazar con tu clave real
        this.initMercadoPago();
    }
    
    initMercadoPago() {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => this.inicializar();
        document.head.appendChild(script);
    }
    
    inicializar() {
        if (window.mp) return;
        
        window.mp = new MercadoPago(this.publicKey, {
            locale: 'es-AR'
        });
    }
    
    async crearPreferencia(items) {
        const preference = {
            items: items.map(item => ({
                title: item.nombre,
                quantity: item.cantidad,
                currency_id: 'ARS',
                unit_price: item.precio,
                picture_url: item.imagen
            })),
            back_urls: {
                success: window.location.origin + '/exito.html',
                failure: window.location.origin + '/error.html',
                pending: window.location.origin + '/pendiente.html'
            },
            auto_return: 'approved',
            payment_methods: {
                excluded_payment_methods: [],
                installments: 6
            },
            statement_descriptor: 'BARA & CO'
        };
        
        try {
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer APP_USR-xxxxxxxxxxxxx',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preference)
            });
            
            const data = await response.json();
            return data.init_point;
            
        } catch (error) {
            console.error('Error al crear preferencia:', error);
            return null;
        }
    }
    
    async abrirCheckout(items) {
        const initPoint = await this.crearPreferencia(items);
        if (initPoint) {
            window.location.href = initPoint;
        } else {
            alert('Error al procesar el pago. Intenta de nuevo.');
        }
    }
}

const mpCheckout = new MercadoPagoCheckout();

// Función para pagar con MP desde el carrito
async function pagarConMercadoPago() {
    if (carrito.items.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    await mpCheckout.abrirCheckout(carrito.items);
}
