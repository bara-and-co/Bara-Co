// Clase Carrito MEJORADA
class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarContador();
        this.actualizarCarritoPanel();
        this.inicializarEventos();
    }

    inicializarEventos() {
        // Cerrar carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cartPanel').classList.contains('open')) {
                this.toggleCart();
            }
        });

        // Eventos para botones dinámicos
        document.addEventListener('click', (e) => {
            // Botones de agregar al carrito (clase .add-to-cart)
            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const btn = e.target.closest('.add-to-cart');
                const producto = {
                    id: btn.dataset.id,
                    nombre: btn.dataset.nombre,
                    precio: parseInt(btn.dataset.precio),
                    imagen: btn.dataset.imagen
                };
                this.agregar(producto);
            }
            
            // Botones de cantidad en carrito
            if (e.target.closest('.qty-btn')) {
                const btn = e.target.closest('.qty-btn');
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                const item = this.items.find(i => i.id === id);
                if (item) {
                    if (action === 'increment') {
                        this.actualizarCantidad(id, item.cantidad + 1);
                    } else if (action === 'decrement') {
                        this.actualizarCantidad(id, item.cantidad - 1);
                    }
                }
            }
            
            // Botones de eliminar
            if (e.target.closest('.remove-item')) {
                const btn = e.target.closest('.remove-item');
                const id = btn.dataset.id;
                this.eliminar(id);
            }
        });
    }

    // Agregar producto
    agregar(producto) {
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
        this.mostrarNotificacion(producto.nombre);
        
        // Feedback visual en el botón
        const botones = document.querySelectorAll(`[data-id="${producto.id}"]`);
        botones.forEach(btn => {
            if (btn.classList.contains('add-to-cart')) {
                const textoOriginal = btn.innerHTML;
                btn.innerHTML = '✓ AGREGADO';
                btn.style.background = 'var(--color-accent)';
                setTimeout(() => {
                    btn.innerHTML = textoOriginal;
                    btn.style.background = '';
                }, 1500);
            }
        });
    }

    // Eliminar producto
    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
    }

    // Vaciar carrito
    vaciar() {
        this.items = [];
        this.guardar();
    }

    // Actualizar cantidad
    actualizarCantidad(id, nuevaCantidad) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (nuevaCantidad <= 0) {
                this.eliminar(id);
            } else {
                item.cantidad = nuevaCantidad;
                this.guardar();
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
        this.actualizarContador();
        this.actualizarCarritoPanel();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('carrito-actualizado', { detail: this.items }));
    }

    // Actualizar contador del carrito
    actualizarContador() {
        const contadores = document.querySelectorAll('.cart-count');
        const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
        
        contadores.forEach(contador => {
            contador.textContent = totalItems;
            
            // Animación cuando cambia
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
                <div style="text-align: center; padding: 60px 20px; color: #999;">
                    <i class="fas fa-shopping-bag" style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.2;"></i>
                    <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">Tu carrito está vacío</p>
                    <a href="tienda.html" style="color: var(--color-accent); text-decoration: underline; font-weight: 500;" onclick="toggleCart()">Explorá nuestra colección</a>
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
                            <p>$${item.precio.toLocaleString('es-AR')}</p>
                        </div>
                        <div class="item-actions">
                            <div class="item-quantity">
                                <button class="qty-btn" data-id="${item.id}" data-action="decrement">-</button>
                                <span>${item.cantidad}</span>
                                <button class="qty-btn" data-id="${item.id}" data-action="increment">+</button>
                            </div>
                            <span class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </span>
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
    mostrarNotificacion(nombreProducto) {
        const notif = document.getElementById('cartNotification');
        if (!notif) return;
        
        const mensaje = notif.querySelector('span');
        mensaje.textContent = `${nombreProducto} agregado al carrito`;
        
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 3000);
    }

    // Toggle del carrito
    toggleCart() {
        const panel = document.getElementById('cartPanel');
        const overlay = document.getElementById('overlay');
        
        if (!panel || !overlay) return;
        
        panel.classList.toggle('open');
        overlay.classList.toggle('active');
        
        if (panel.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Finalizar compra por WhatsApp
    finalizarWhatsApp() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('Tu carrito está vacío');
            return;
        }
        
        let mensaje = '🛍️ *NUEVO PEDIDO - BARA & CO*%0A%0A';
        
        this.items.forEach(item => {
            mensaje += `▪️ ${item.nombre}%0A`;
            mensaje += `   ${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${(item.cantidad * item.precio).toLocaleString('es-AR')}%0A`;
        });
        
        const total = this.getSubtotal();
        mensaje += `%0A*TOTAL: $${total.toLocaleString('es-AR')}*%0A%0A`;
        mensaje += '📌 *DATOS DEL CLIENTE*%0A';
        mensaje += 'Nombre: %0A';
        mensaje += 'Teléfono: %0A';
        mensaje += 'Dirección: %0A%0A';
        mensaje += '💬 ¿Me confirmás disponibilidad y formas de pago?';
        
        // Número de WhatsApp (configurar)
        const numero = '5493511234567'; // <-- CAMBIAR POR EL REAL
        window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
        
        // Opcional: Vaciar carrito después de enviar
        // this.vaciar();
    }

    // Finalizar con MercadoPago
    async finalizarMercadoPago() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('Tu carrito está vacío');
            return;
        }
        
        // Aquí iría la integración con MP
        // Por ahora redirigimos a WhatsApp
        this.finalizarWhatsApp();
    }
}

// Inicializar carrito
const carrito = new Carrito();

// Función global para toggle
function toggleCart() {
    carrito.toggleCart();
}

// Función global para agregar al carrito
function agregarAlCarrito(id, nombre, precio, imagen) {
    carrito.agregar({ id, nombre, precio, imagen });
}
