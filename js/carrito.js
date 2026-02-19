// ===========================================
// CARRITO DE COMPRAS - BARA & CO
// VERSIÓN CORREGIDA - AGREGAR PRODUCTOS FUNCIONA
// ===========================================

class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.initEventosGlobales();
        this.actualizarUI();
    }

    // Inicializar eventos globales (funciona para elementos dinámicos)
    initEventosGlobales() {
        // Usar event delegation en todo el documento
        document.addEventListener('click', (e) => {
            // Botón AGREGAR AL CARRITO (clase .add-to-cart o botones con data-atributos)
            const addButton = e.target.closest('.add-to-cart, .quick-add, .add-to-cart-card, [onclick*="agregarAlCarrito"]');
            
            if (addButton) {
                e.preventDefault();
                e.stopPropagation();
                
                // Obtener datos del producto
                let id, nombre, precio, imagen;
                
                // Opción 1: Data attributes (recomendado)
                if (addButton.dataset.id) {
                    id = addButton.dataset.id;
                    nombre = addButton.dataset.nombre;
                    precio = parseInt(addButton.dataset.precio);
                    imagen = addButton.dataset.imagen;
                } 
                // Opción 2: Función onclick existente
                else if (addButton.hasAttribute('onclick')) {
                    // Extraer de la función onclick (para compatibilidad)
                    const onclickAttr = addButton.getAttribute('onclick');
                    const match = onclickAttr.match(/agregarAlCarrito\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*,\s*['"]([^'"]+)['"]\s*\)/);
                    if (match) {
                        id = match[1];
                        nombre = match[2];
                        precio = parseInt(match[3]);
                        imagen = match[4];
                    }
                }
                
                if (id && nombre && precio && imagen) {
                    this.agregar({ id, nombre, precio, imagen }, addButton);
                } else {
                    console.warn('Faltan datos del producto', addButton);
                }
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

        // Escuchar cambios en localStorage (para múltiples pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'carrito') {
                this.items = JSON.parse(e.newValue) || [];
                this.actualizarUI();
            }
        });

        console.log('✅ Eventos del carrito inicializados');
    }

    // Agregar producto al carrito
    agregar(producto, boton = null) {
        // Validar producto
        if (!producto || !producto.id || !producto.nombre || !producto.precio) {
            console.error('❌ Producto inválido:', producto);
            this.mostrarNotificacion('Error al agregar producto', 'error');
            return;
        }

        // Buscar si ya existe
        const existente = this.items.find(item => item.id === producto.id);
        
        if (existente) {
            existente.cantidad += 1;
            console.log(`🔄 Producto existente: ${producto.nombre}, nueva cantidad: ${existente.cantidad}`);
        } else {
            this.items.push({
                ...producto,
                cantidad: 1
            });
            console.log(`✅ Nuevo producto agregado: ${producto.nombre}`);
        }
        
        // Guardar y actualizar UI
        this.guardar();
        this.mostrarNotificacion(`✓ ${producto.nombre} agregado al carrito`, 'success');
        
        // Feedback visual en el botón
        if (boton) {
            this.animarBoton(boton);
        }
    }

    // Animar botón después de agregar
    animarBoton(boton) {
        const textoOriginal = boton.innerHTML;
        const colorOriginal = boton.style.background;
        
        boton.innerHTML = '✓ AGREGADO';
        boton.style.background = 'var(--color-accent)';
        boton.style.color = 'white';
        boton.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.style.background = colorOriginal;
            boton.style.color = '';
            boton.style.transform = '';
        }, 1500);
    }

    // Eliminar producto
    eliminar(id) {
        const producto = this.items.find(item => item.id === id);
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
        if (producto) {
            this.mostrarNotificacion(`✗ ${producto.nombre} eliminado`, 'warning');
        }
    }

    // Vaciar carrito completo
    vaciar() {
        if (this.items.length === 0) return;
        this.items = [];
        this.guardar();
        this.mostrarNotificacion('Carrito vaciado', 'info');
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
            
            // Animación sutil
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
                    <a href="tienda.html" class="btn-empty" onclick="carrito.toggleCart(); return false;">Explorar productos</a>
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
        } else if (tipo === 'warning') {
            icono.className = 'fas fa-info-circle';
            icono.style.color = '#ffaa00';
        } else {
            icono.className = 'fas fa-exclamation-circle';
            icono.style.color = '#ff4444';
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

    pagarConWhatsApp() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }
        
        const whatsappNumber = '5493511234567'; // ¡CAMBIAR!
        
        let mensaje = '🛍️ *NUEVO PEDIDO - BARA & CO*%0A%0A';
        
        this.items.forEach(item => {
            mensaje += `▪️ *${item.nombre}*%0A`;
            mensaje += `   ${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${(item.cantidad * item.precio).toLocaleString('es-AR')}%0A`;
        });
        
        const total = this.getSubtotal();
        mensaje += `%0a📦 *TOTAL: $${total.toLocaleString('es-AR')}*%0A%0A`;
        mensaje += '👤 *DATOS DEL CLIENTE*%0A';
        mensaje += 'Nombre y apellido:%0A';
        mensaje += 'Teléfono:%0A';
        mensaje += 'Dirección:%0A%0A';
        mensaje += '💬 Consulto por medios de pago y disponibilidad.';
        
        window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');
    }

    pagarConMercadoPago() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }
        
        this.mostrarNotificacion('Preparando pago...', 'info');
        
        // Simulación - en producción redirigir a MP
        setTimeout(() => {
            alert('Redirigiendo a MercadoPago (modo simulación)');
            // this.pagarConWhatsApp(); // fallback
        }, 1000);
    }
}

// ===== INICIALIZACIÓN =====
let carrito;

// Asegurar que el carrito se inicialice después de que cargue el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        carrito = new Carrito();
        window.carrito = carrito;
        console.log('🛒 Carrito inicializado');
    });
} else {
    carrito = new Carrito();
    window.carrito = carrito;
    console.log('🛒 Carrito inicializado');
}

// Funciones globales para compatibilidad
function toggleCart() {
    if (carrito) carrito.toggleCart();
}

function agregarAlCarrito(id, nombre, precio, imagen) {
    if (carrito) {
        carrito.agregar({ id, nombre, precio, imagen });
    } else {
        console.error('Carrito no inicializado');
    }
}
