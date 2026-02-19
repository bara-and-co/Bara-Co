// Clase Carrito MEJORADA con doble opción de pago
class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.initEventos();
        this.actualizarUI();
    }
    constructor() {
    this.items = JSON.parse(localStorage.getItem('carrito')) || [];
    this.initEventos();
    this.actualizarUI();
    
    // Escuchar cambios en localStorage (para múltiples pestañas)
    window.addEventListener('storage', (e) => {
        if (e.key === 'carrito') {
            this.items = JSON.parse(e.newValue) || [];
            this.actualizarUI();
        }
    });
}

    initEventos() {
        // Eventos globales para botones dinámicos
        document.addEventListener('click', (e) => {
            // Agregar al carrito
            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart');
                const producto = {
                    id: btn.dataset.id,
                    nombre: btn.dataset.nombre,
                    precio: parseInt(btn.dataset.precio),
                    imagen: btn.dataset.imagen
                };
                this.agregar(producto, btn);
            }
            
            // Botones de cantidad en carrito
            if (e.target.closest('.qty-btn')) {
                const btn = e.target.closest('.qty-btn');
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                this.actualizarCantidad(id, action);
            }
            
            // Botones de eliminar
            if (e.target.closest('.remove-item')) {
                const btn = e.target.closest('.remove-item');
                const id = btn.dataset.id;
                this.eliminar(id);
            }
        });

        // Cerrar carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cartPanel')?.classList.contains('open')) {
                this.toggleCart();
            }
        });
    }

    // Agregar producto
    agregar(producto, boton = null) {
        if (!producto.id || !producto.nombre || !producto.precio) {
            console.error('Producto inválido:', producto);
            return;
        }
        
        const existente = this.items.find(item => item.id === producto.id);
        
        if (existente) {
            existente.cantidad += 1;
        } else {
            this.items.push({
                ...producto,
                cantidad: 1
            });
        }
        
        this.guardar();
        this.mostrarNotificacion(`✓ ${producto.nombre} agregado`);
        
        // Feedback visual en el botón
        if (boton) {
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '✓ AGREGADO';
            boton.style.background = 'var(--color-accent)';
            boton.style.color = 'white';
            setTimeout(() => {
                boton.innerHTML = textoOriginal;
                boton.style.background = '';
                boton.style.color = '';
            }, 1500);
        }
    }

    // Eliminar producto
    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
        this.mostrarNotificacion('Producto eliminado', 'warning');
    }

    // Vaciar carrito
    vaciar() {
        if (this.items.length === 0) return;
        this.items = [];
        this.guardar();
        this.mostrarNotificacion('Carrito vaciado', 'warning');
    }

    // Actualizar cantidad
    actualizarCantidad(id, action) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        
        if (action === 'increment') {
            item.cantidad += 1;
            this.guardar();
        } else if (action === 'decrement') {
            if (item.cantidad > 1) {
                item.cantidad -= 1;
                this.guardar();
            } else {
                this.eliminar(id);
            }
        }
    }

    // Calcular subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    // Guardar en localStorage
    guardar() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarUI();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('carrito-actualizado', { 
            detail: { items: this.items, total: this.getSubtotal() }
        }));
    }

    // Actualizar toda la UI
    actualizarUI() {
        this.actualizarContador();
        this.actualizarCarritoPanel();
    }

    // Actualizar contador
    actualizarContador() {
        const contadores = document.querySelectorAll('.cart-count');
        const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
        
        contadores.forEach(contador => {
            contador.textContent = totalItems;
            
            // Animación
            contador.style.transform = 'scale(1.3)';
            setTimeout(() => {
                contador.style.transform = 'scale(1)';
            }, 200);
        });
    }

    // Actualizar panel del carrito
    actualizarCarritoPanel() {
        const cartItems = document.querySelector('.cart-items');
        const subtotalSpan = document.getElementById('subtotal');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                    <a href="tienda.html" class="btn-empty" onclick="carrito.toggleCart()">Explorar productos</a>
                </div>
            `;
        } else {
            let html = '';
            this.items.forEach(item => {
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="item-image">
                            <img src="${item.imagen}" alt="${item.nombre}" loading="lazy">
                        </div>
                        <div class="item-details">
                            <h4>${item.nombre}</h4>
                            <p class="item-price">$${item.precio.toLocaleString('es-AR')}</p>
                        </div>
                        <div class="item-actions">
                            <div class="item-quantity">
                                <button class="qty-btn" data-id="${item.id}" data-action="decrement">−</button>
                                <span class="quantity">${item.cantidad}</span>
                                <button class="qty-btn" data-id="${item.id}" data-action="increment">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            cartItems.innerHTML = html;
        }
        
        if (subtotalSpan) {
            subtotalSpan.textContent = `$${this.getSubtotal().toLocaleString('es-AR')}`;
        }
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.getElementById('cartNotification');
        if (!notif) return;
        
        const icono = notif.querySelector('i');
        const texto = notif.querySelector('span');
        
        texto.textContent = mensaje;
        
        if (tipo === 'success') {
            icono.className = 'fas fa-check-circle';
            icono.style.color = 'var(--color-accent)';
        } else {
            icono.className = 'fas fa-info-circle';
            icono.style.color = '#ffaa00';
        }
        
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 2500);
    }

    // Toggle carrito
    toggleCart() {
        const panel = document.getElementById('cartPanel');
        const overlay = document.getElementById('overlay');
        
        if (!panel || !overlay) return;
        
        panel.classList.toggle('open');
        overlay.classList.toggle('active');
        
        document.body.style.overflow = panel.classList.contains('open') ? 'hidden' : '';
    }

    // ===== OPCIONES DE PAGO =====

    // Opción 1: Pago por WhatsApp
    pagarConWhatsApp() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }
        
        // Configurar número de WhatsApp
        const whatsappNumber = '5493511234567'; // ¡CAMBIAR POR EL NÚMERO REAL!
        
        // Crear mensaje
        let mensaje = '🛍️ *NUEVO PEDIDO - BARA & CO*%0A%0A';
        
        this.items.forEach(item => {
            mensaje += `▪️ *${item.nombre}*%0A`;
            mensaje += `   ${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${(item.cantidad * item.precio).toLocaleString('es-AR')}%0A`;
        });
        
        const total = this.getSubtotal();
        mensaje += `%0a📦 *TOTAL: $${total.toLocaleString('es-AR')}*%0A%0A`;
        mensaje += '👤 *DATOS DEL CLIENTE*%0A';
        mensaje += 'Nombre y apellido:%0A';
        mensaje += 'Teléfono de contacto:%0A';
        mensaje += 'Dirección de envío:%0A%0A';
        mensaje += '💬 Consulto por medios de pago y disponibilidad. ¡Gracias!';
        
        // Abrir WhatsApp
        window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');
        
        // Opcional: preguntar si quiere vaciar carrito
        setTimeout(() => {
            if (confirm('¿Querés vaciar el carrito después de enviar el pedido?')) {
                this.vaciar();
            }
        }, 500);
    }

    // Opción 2: Pago con MercadoPago
    async pagarConMercadoPago() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }
        
        // Mostrar loading
        this.mostrarNotificacion('Preparando pago...', 'success');
        
        try {
            // Aquí iría la integración real con MercadoPago
            // Por ahora simulamos una redirección exitosa
            
            // En un caso real, llamarías a tu backend para crear la preferencia
            // y obtendrías el init_point
            
            const preferencia = await this.crearPreferenciaMercadoPago();
            
            if (preferencia && preferencia.init_point) {
                // Redirigir a MercadoPago
                window.location.href = preferencia.init_point;
            } else {
                // Fallback a WhatsApp
                if (confirm('Hubo un problema con MercadoPago. ¿Querés pagar por WhatsApp?')) {
                    this.pagarConWhatsApp();
                }
            }
            
        } catch (error) {
            console.error('Error en MercadoPago:', error);
            this.mostrarNotificacion('Error al procesar pago', 'warning');
            
            // Fallback
            if (confirm('Error con MercadoPago. ¿Querés pagar por WhatsApp?')) {
                this.pagarConWhatsApp();
            }
        }
    }

    // Simulación de creación de preferencia (para desarrollo)
    async crearPreferenciaMercadoPago() {
        // IMPORTANTE: Esto es una simulación
        // En producción, esto debe ser una llamada a tu backend
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular respuesta exitosa
                resolve({
                    init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789'
                });
            }, 1000);
        });
    }
}

// Inicializar carrito
const carrito = new Carrito();

// Funciones globales
function toggleCart() {
    carrito.toggleCart();
}

function agregarAlCarrito(id, nombre, precio, imagen) {
    carrito.agregar({ id, nombre, precio, imagen });
}

// Hacer carrito accesible globalmente
window.carrito = carrito;
