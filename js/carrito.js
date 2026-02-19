// Clase Carrito
class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarContador();
        this.actualizarCarritoPanel();
    }

    // Agregar producto
    agregar(producto) {
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
    }

    // Eliminar producto
    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
    }

    // Actualizar cantidad
    actualizarCantidad(id, nuevaCantidad) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.cantidad = nuevaCantidad;
            if (item.cantidad <= 0) {
                this.eliminar(id);
            } else {
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
    }

    // Actualizar contador del carrito
    actualizarContador() {
        const contadores = document.querySelectorAll('.cart-count');
        const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
        
        contadores.forEach(contador => {
            contador.textContent = totalItems;
        });
    }

    // Actualizar panel del carrito
    actualizarCarritoPanel() {
        const cartItems = document.querySelector('.cart-items');
        const subtotalSpan = document.getElementById('subtotal');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: #999;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Tu carrito está vacío</p>
                    <a href="tienda.html" style="color: var(--color-accent); text-decoration: underline; margin-top: 1rem; display: inline-block;">Explorá nuestra colección</a>
                </div>
            `;
        } else {
            let html = '';
            this.items.forEach(item => {
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="item-image">
                            <img src="${item.imagen}" alt="${item.nombre}">
                        </div>
                        <div class="item-details">
                            <h4>${item.nombre}</h4>
                            <p>$${item.precio.toLocaleString('es-AR')}</p>
                        </div>
                        <div class="item-actions">
                            <div class="item-quantity">
                                <button class="qty-btn" onclick="carrito.actualizarCantidad('${item.id}', ${item.cantidad - 1})">-</button>
                                <span>${item.cantidad}</span>
                                <button class="qty-btn" onclick="carrito.actualizarCantidad('${item.id}', ${item.cantidad + 1})">+</button>
                            </div>
                            <span class="remove-item" onclick="carrito.eliminar('${item.id}')">
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
        const mensaje = notif.querySelector('span');
        mensaje.textContent = `${nombreProducto} agregado`;
        
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 3000);
    }

    // Finalizar compra por WhatsApp
    finalizarWhatsApp() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        let mensaje = 'Hola! Quiero finalizar mi compra:%0A%0A';
        
        this.items.forEach(item => {
            mensaje += `▪️ ${item.nombre} - ${item.cantidad} x $${item.precio.toLocaleString('es-AR')}%0A`;
        });
        
        mensaje += `%0A*TOTAL: $${this.getSubtotal().toLocaleString('es-AR')}*%0A%0A`;
        mensaje += '¿Me confirmás disponibilidad y formas de pago?';
        
        // Número de WhatsApp del negocio (cambiar por el real)
        const numero = '5493511234567';
        window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    }
}

// Inicializar carrito
const carrito = new Carrito();

// Función para toggle del carrito
function toggleCart() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('overlay');
    
    panel.classList.toggle('open');
    overlay.classList.toggle('active');
    
    if (panel.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Función para agregar al carrito (usar desde botones)
function agregarAlCarrito(id, nombre, precio, imagen) {
    carrito.agregar({ id, nombre, precio, imagen });
}
