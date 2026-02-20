// ===========================================
// CARRITO DE COMPRAS - BARA & CO
// VERSIÓN UNIFICADA CON TODAS LAS FUNCIONALIDADES
// ===========================================

class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('bc_cart')) || [];
        this.envio = JSON.parse(localStorage.getItem('bc_shipping')) || {
            metodo: 'estandar',
            costo: 1200,
            nombre: '',
            telefono: '',
            direccion: '',
            ciudad: '',
            codigoPostal: ''
        };
        this.init();
    }

    init() {
        this.actualizarUI();
        this.initEventos();
        
        // Escuchar cambios en localStorage de otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'bc_cart') {
                this.items = JSON.parse(e.newValue) || [];
                this.actualizarUI();
            }
            if (e.key === 'bc_shipping') {
                this.envio = JSON.parse(e.newValue) || this.envio;
                this.actualizarUI();
            }
        });
    }

    initEventos() {
        // Eventos globales con delegación
        document.addEventListener('click', (e) => {
            // Agregar al carrito
            const addBtn = e.target.closest('.add-to-cart, .add-to-cart-card');
            if (addBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const id = addBtn.dataset.id;
                const nombre = addBtn.dataset.nombre;
                const precio = parseInt(addBtn.dataset.precio);
                const imagen = addBtn.dataset.imagen;
                
                if (id && nombre && precio && imagen) {
                    this.agregar({ id, nombre, precio, imagen }, addBtn);
                }
            }
            
            // Botones de cantidad
            const qtyBtn = e.target.closest('.qty-btn');
            if (qtyBtn) {
                const id = qtyBtn.dataset.id;
                const action = qtyBtn.dataset.action;
                this.actualizarCantidad(id, action);
            }
            
            // Botón eliminar
            const removeBtn = e.target.closest('.remove-item');
            if (removeBtn) {
                const id = removeBtn.dataset.id;
                this.eliminar(id);
            }
            
            // Botón mostrar formulario envío
            if (e.target.closest('.btn-show-shipping')) {
                this.mostrarFormularioEnvio();
            }
            
            // Botón guardar envío
            if (e.target.closest('.btn-save-shipping')) {
                this.guardarEnvio();
            }
            
            // Botón editar envío
            if (e.target.closest('.btn-edit-shipping')) {
                this.mostrarFormularioEnvio();
            }
            
            // Botón cancelar envío
            if (e.target.closest('.btn-cancel-shipping')) {
                this.actualizarUI();
            }
        });
        
        // Tecla ESC para cerrar carrito
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarPanel();
            }
        });
    }

    agregar(producto, boton = null) {
        if (!producto.id || !producto.nombre || !producto.precio) {
            console.error('Producto inválido', producto);
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
        this.mostrarNotificacion(`✓ ${producto.nombre} agregado al carrito`, 'success');
        
        if (boton) {
            this.animarBoton(boton);
        }
    }

    animarBoton(boton) {
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '✓ AGREGADO';
        boton.style.background = 'var(--color-accent)';
        boton.style.color = 'var(--color-bg)';
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.style.background = '';
            boton.style.color = '';
        }, 1500);
    }

    eliminar(id) {
        const producto = this.items.find(item => item.id === id);
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
        if (producto) {
            this.mostrarNotificacion(`✗ ${producto.nombre} eliminado`, 'warning');
        }
    }

    vaciar() {
        if (this.items.length === 0) return;
        this.items = [];
        this.envio = {
            metodo: 'estandar',
            costo: 1200,
            nombre: '',
            telefono: '',
            direccion: '',
            ciudad: '',
            codigoPostal: ''
        };
        localStorage.removeItem('bc_shipping');
        this.guardar();
        this.mostrarNotificacion('Carrito vaciado', 'info');
    }

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

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    getEnvioGratis() {
        return this.getSubtotal() >= 80000;
    }

    getCostoEnvio() {
        if (this.getEnvioGratis()) return 0;
        if (this.envio.metodo === 'retiro') return 0;
        if (this.envio.metodo === 'express') return 2500;
        return 1200; // estándar
    }

    getTotal() {
        return this.getSubtotal() + this.getCostoEnvio();
    }

    guardarEnvio() {
        const metodo = document.querySelector('input[name="shipping-method"]:checked')?.value;
        if (!metodo) {
            this.mostrarNotificacion('Seleccioná un método de envío', 'warning');
            return;
        }

        const nombre = document.getElementById('shipping-nombre')?.value;
        const telefono = document.getElementById('shipping-telefono')?.value;
        const direccion = document.getElementById('shipping-direccion')?.value;
        const ciudad = document.getElementById('shipping-ciudad')?.value;
        const codigoPostal = document.getElementById('shipping-codigo')?.value;

        if (metodo !== 'retiro') {
            if (!nombre || !telefono || !direccion || !ciudad || !codigoPostal) {
                this.mostrarNotificacion('Completá todos los datos de envío', 'warning');
                return;
            }
        }

        let costo = 0;
        if (metodo === 'estandar') costo = this.getEnvioGratis() ? 0 : 1200;
        else if (metodo === 'express') costo = 2500;

        this.envio = {
            metodo,
            costo,
            nombre: nombre || '',
            telefono: telefono || '',
            direccion: direccion || '',
            ciudad: ciudad || '',
            codigoPostal: codigoPostal || '',
            instrucciones: document.getElementById('shipping-instrucciones')?.value || ''
        };

        localStorage.setItem('bc_shipping', JSON.stringify(this.envio));
        this.actualizarUI();
        this.mostrarNotificacion('Datos de envío guardados', 'success');
    }

    guardar() {
        localStorage.setItem('bc_cart', JSON.stringify(this.items));
        this.actualizarUI();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('carrito-actualizado', { 
            detail: { 
                items: this.items, 
                total: this.getTotal(),
                cantidad: this.items.reduce((s,i) => s + i.cantidad, 0)
            }
        }));
    }

    actualizarUI() {
        this.actualizarContador();
        this.actualizarPanel();
    }

    actualizarContador() {
        const contadores = document.querySelectorAll('.cart-count, .cart-badge');
        const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
        
        contadores.forEach(contador => {
            contador.textContent = totalItems;
            if (totalItems > 0) {
                contador.classList.add('on');
            } else {
                contador.classList.remove('on');
            }
        });
    }

    actualizarPanel() {
        const cartPanel = document.querySelector('.cart-panel');
        if (!cartPanel) return;
        
        const cartItems = cartPanel.querySelector('.cart-items');
        const cartFooter = cartPanel.querySelector('.cart-footer');
        
        if (!cartItems || !cartFooter) return;
        
        // Renderizar items
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                    <button class="btn-empty" onclick="carrito.cerrarPanel(); window.location.href='tienda.html'">
                        Explorar productos
                    </button>
                </div>
            `;
            
            cartFooter.innerHTML = `
                <div class="subtotal">
                    <span>Subtotal</span>
                    <span>$0</span>
                </div>
                <p class="empty-message" style="text-align:center;color:var(--color-text-secondary);padding:1rem;">
                    Agregá productos para continuar
                </p>
            `;
            return;
        }

        // Mostrar items
        let itemsHtml = '';
        this.items.forEach(item => {
            itemsHtml += `
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
                        <button class="remove-item" data-id="${item.id}" title="Eliminar">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        cartItems.innerHTML = itemsHtml;

        // Footer según estado de envío
        const envioGratis = this.getEnvioGratis();
        const subtotal = this.getSubtotal();
        
        if (this.envio.nombre && this.envio.direccion) {
            // Ya tiene datos de envío
            cartFooter.innerHTML = `
                <div class="shipping-summary">
                    <div class="subtotal">
                        <span>Subtotal</span>
                        <span>$${subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    <div class="summary-row shipping-cost">
                        <span>Envío (${this.envio.metodo === 'retiro' ? 'Retiro' : this.envio.metodo === 'express' ? 'Express' : 'Estándar'})</span>
                        <span>${this.getCostoEnvio() === 0 ? 'Gratis' : '$' + this.getCostoEnvio().toLocaleString('es-AR')}</span>
                    </div>
                    <div class="summary-row total">
                        <span><strong>TOTAL</strong></span>
                        <span><strong>$${this.getTotal().toLocaleString('es-AR')}</strong></span>
                    </div>
                    
                    <div class="shipping-details-summary">
                        <h4>Datos de entrega</h4>
                        <p><i class="fas fa-user"></i> ${this.envio.nombre}</p>
                        <p><i class="fas fa-phone"></i> ${this.envio.telefono}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${this.envio.direccion}, ${this.envio.ciudad} (CP ${this.envio.codigoPostal})</p>
                        ${this.envio.instrucciones ? `<p><i class="fas fa-info-circle"></i> ${this.envio.instrucciones}</p>` : ''}
                        <button class="btn-edit-shipping btn-link">✎ Editar datos de envío</button>
                    </div>
                    
                    <div class="payment-options">
                        <button class="payment-btn mercadopago-btn" onclick="carrito.pagarMercadoPago()">
                            <i class="fab fa-mercadopago"></i>
                            Pagar con Mercado Pago
                        </button>
                        
                        <button class="payment-btn whatsapp-btn" onclick="carrito.pagarWhatsApp()">
                            <i class="fab fa-whatsapp"></i>
                            Consultar por WhatsApp
                        </button>
                    </div>
                    
                    <p class="payment-info">
                        <i class="fas fa-lock"></i>
                        Pago seguro con Mercado Pago
                    </p>
                </div>
            `;
        } else {
            // Mostrar opciones de envío
            cartFooter.innerHTML = `
                <div class="subtotal">
                    <span>Subtotal</span>
                    <span>$${subtotal.toLocaleString('es-AR')}</span>
                </div>
                
                ${envioGratis ? '<p class="free-shipping-note"><i class="fas fa-truck"></i> ¡Envío gratis disponible!</p>' : ''}
                
                <button class="btn-shipping btn-show-shipping">
                    <i class="fas fa-truck"></i>
                    Agregar datos de envío
                </button>
            `;
        }
    }

    mostrarFormularioEnvio() {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;

        const envioGratis = this.getEnvioGratis();

        cartFooter.innerHTML = `
            <div class="shipping-form">
                <h3>Datos de envío</h3>
                
                <div class="shipping-methods">
                    <label class="shipping-option ${this.envio.metodo === 'retiro' ? 'selected' : ''}">
                        <input type="radio" name="shipping-method" value="retiro" ${this.envio.metodo === 'retiro' ? 'checked' : ''}>
                        <div>
                            <strong>Retiro en local</strong>
                            <span class="shipping-price">Gratis</span>
                            <small>Ing. Olmos 139 - Jesús María</small>
                        </div>
                    </label>
                    
                    <label class="shipping-option ${this.envio.metodo === 'estandar' ? 'selected' : ''}">
                        <input type="radio" name="shipping-method" value="estandar" ${this.envio.metodo === 'estandar' ? 'checked' : ''}>
                        <div>
                            <strong>Envío estándar</strong>
                            <span class="shipping-price">${envioGratis ? 'Gratis' : '$1.200'}</span>
                            <small>3-7 días hábiles</small>
                        </div>
                    </label>
                    
                    <label class="shipping-option ${this.envio.metodo === 'express' ? 'selected' : ''}">
                        <input type="radio" name="shipping-method" value="express" ${this.envio.metodo === 'express' ? 'checked' : ''}>
                        <div>
                            <strong>Envío express</strong>
                            <span class="shipping-price">$2.500</span>
                            <small>24/48 hs hábiles</small>
                        </div>
                    </label>
                </div>
                
                <div class="shipping-details">
                    <h4>Datos de contacto</h4>
                    
                    <input type="text" id="shipping-nombre" placeholder="Nombre completo" value="${this.envio.nombre || ''}">
                    <input type="tel" id="shipping-telefono" placeholder="Teléfono de contacto" value="${this.envio.telefono || ''}">
                    <input type="text" id="shipping-direccion" placeholder="Dirección" value="${this.envio.direccion || ''}">
                    
                    <div class="shipping-row">
                        <input type="text" id="shipping-ciudad" placeholder="Ciudad" value="${this.envio.ciudad || ''}">
                        <input type="text" id="shipping-codigo" placeholder="Código postal" value="${this.envio.codigoPostal || ''}">
                    </div>
                    
                    <textarea id="shipping-instrucciones" placeholder="Instrucciones adicionales (opcional)">${this.envio.instrucciones || ''}</textarea>
                </div>
                
                <div class="shipping-buttons">
                    <button class="btn-save-shipping">Guardar datos</button>
                    <button class="btn-cancel-shipping">Cancelar</button>
                </div>
            </div>
        `;

        // Actualizar visibilidad de campos según método
        document.querySelectorAll('input[name="shipping-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const isRetiro = radio.value === 'retiro';
                document.querySelectorAll('.shipping-details input, .shipping-details textarea').forEach(field => {
                    if (isRetiro && field.id !== 'shipping-instrucciones') {
                        field.disabled = true;
                        field.style.opacity = '0.5';
                    } else {
                        field.disabled = false;
                        field.style.opacity = '1';
                    }
                });
                
                document.querySelectorAll('.shipping-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.querySelector('input').checked);
                });
            });
        });

        // Trigger inicial
        const retiroChecked = document.querySelector('input[name="shipping-method"]:checked')?.value === 'retiro';
        if (retiroChecked) {
            document.querySelectorAll('.shipping-details input, .shipping-details textarea').forEach(field => {
                if (field.id !== 'shipping-instrucciones') {
                    field.disabled = true;
                    field.style.opacity = '0.5';
                }
            });
        }
    }

    pagarMercadoPago() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }

        if (!this.envio.nombre || !this.envio.direccion) {
            this.mostrarFormularioEnvio();
            this.mostrarNotificacion('Completá tus datos de envío', 'warning');
            return;
        }

        const total = this.getTotal();
        const montoParaLink = total.toString().replace(/\./g, '');
        const linkMP = `https://link.mercadopago.com.ar/baraandco?amount=${montoParaLink}`;
        
        window.open(linkMP, '_blank');
        this.mostrarNotificacion('Serás redirigido a Mercado Pago', 'info');
    }

    pagarWhatsApp() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }

        if (!this.envio.nombre || !this.envio.direccion) {
            this.mostrarFormularioEnvio();
            this.mostrarNotificacion('Completá tus datos de envío', 'warning');
            return;
        }
        
        const whatsappNumber = '5493525614281';
        
        let mensaje = '🛍️ *NUEVO PEDIDO - BARA & CO*%0A%0A';
        mensaje += '📦 *PRODUCTOS*%0A';
        
        this.items.forEach(item => {
            mensaje += `▪️ ${item.nombre}%0A`;
            mensaje += `   ${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${(item.cantidad * item.precio).toLocaleString('es-AR')}%0A`;
        });
        
        const subtotal = this.getSubtotal();
        const total = this.getTotal();
        const costoEnvio = total - subtotal;
        
        mensaje += `%0a📊 *SUBTOTAL: $${subtotal.toLocaleString('es-AR')}*%0A`;
        mensaje += `🚚 *ENVÍO (${this.envio.metodo}): ${costoEnvio === 0 ? 'Gratis' : '$' + costoEnvio.toLocaleString('es-AR')}*%0A`;
        mensaje += `💰 *TOTAL: $${total.toLocaleString('es-AR')}*%0A%0A`;
        
        mensaje += '👤 *DATOS DEL CLIENTE*%0A';
        mensaje += `Nombre: ${this.envio.nombre}%0A`;
        mensaje += `Teléfono: ${this.envio.telefono}%0A`;
        mensaje += `Dirección: ${this.envio.direccion}, ${this.envio.ciudad} (CP ${this.envio.codigoPostal})%0A`;
        if (this.envio.instrucciones) {
            mensaje += `Instrucciones: ${this.envio.instrucciones}%0A`;
        }
        mensaje += `%0a💬 Consulto por disponibilidad y medios de pago.`;
        
        window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, '_blank');
    }

    togglePanel() {
        const panel = document.querySelector('.cart-panel');
        const overlay = document.querySelector('.overlay');
        
        if (panel && overlay) {
            panel.classList.toggle('open');
            overlay.classList.toggle('active');
            
            if (panel.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    cerrarPanel() {
        const panel = document.querySelector('.cart-panel');
        const overlay = document.querySelector('.overlay');
        
        if (panel && overlay) {
            panel.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.getElementById('cartNotification');
        if (!notif) {
            // Crear notificación si no existe
            this.crearNotificacion();
            setTimeout(() => this.mostrarNotificacion(mensaje, tipo), 100);
            return;
        }
        
        const icono = notif.querySelector('i');
        const texto = notif.querySelector('span');
        
        texto.textContent = mensaje;
        
        if (tipo === 'success') {
            icono.className = 'fas fa-check-circle';
            icono.style.color = 'var(--color-accent)';
        } else if (tipo === 'warning') {
            icono.className = 'fas fa-exclamation-triangle';
            icono.style.color = '#ffaa00';
        } else {
            icono.className = 'fas fa-info-circle';
            icono.style.color = 'var(--color-accent)';
        }
        
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 2500);
    }

    crearNotificacion() {
        const notif = document.createElement('div');
        notif.id = 'cartNotification';
        notif.className = 'cart-notification';
        notif.innerHTML = '<i class="fas fa-check-circle"></i><span></span>';
        document.body.appendChild(notif);
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================
let carrito;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
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
    if (carrito) carrito.togglePanel();
}

function agregarAlCarrito(id, nombre, precio, imagen) {
    if (carrito) {
        carrito.agregar({ id, nombre, precio, imagen });
    } else {
        console.error('Carrito no inicializado');
        // Intentar de nuevo en 100ms
        setTimeout(() => {
            if (carrito) carrito.agregar({ id, nombre, precio, imagen });
        }, 100);
    }
}
