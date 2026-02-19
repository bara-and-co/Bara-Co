// ===========================================
// CARRITO DE COMPRAS - BARA & CO
// VERSIÓN MEJORADA - DETALLES + OPCIONES DE ENVÍO + MERCADO PAGO
// ===========================================

class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.envio = JSON.parse(localStorage.getItem('envio')) || {
            metodo: 'estandar',
            costo: 1200,
            direccion: null,
            nombre: null,
            telefono: null
        };
        this.initEventosGlobales();
        this.actualizarUI();
    }

    // Inicializar eventos globales
    initEventosGlobales() {
        document.addEventListener('click', (e) => {
            // Botón AGREGAR AL CARRITO
            const addButton = e.target.closest('.add-to-cart, .quick-add, .add-to-cart-card, [onclick*="agregarAlCarrito"]');
            
            if (addButton) {
                e.preventDefault();
                e.stopPropagation();
                
                let id, nombre, precio, imagen;
                
                if (addButton.dataset.id) {
                    id = addButton.dataset.id;
                    nombre = addButton.dataset.nombre;
                    precio = parseInt(addButton.dataset.precio);
                    imagen = addButton.dataset.imagen;
                } else if (addButton.hasAttribute('onclick')) {
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

            // Botón para mostrar formulario de envío
            if (e.target.closest('.show-shipping-form')) {
                this.mostrarFormularioEnvio();
            }

            // Botón para guardar datos de envío
            if (e.target.closest('.save-shipping')) {
                this.guardarDatosEnvio();
            }

            // Botón para editar envío
            if (e.target.closest('.edit-shipping')) {
                this.mostrarFormularioEnvio();
            }
        });

        // Cerrar carrito con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('cartPanel')?.classList.contains('open')) {
                this.toggleCart();
            }
        });

        // Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'carrito') {
                this.items = JSON.parse(e.newValue) || [];
                this.actualizarUI();
            }
            if (e.key === 'envio') {
                this.envio = JSON.parse(e.newValue) || this.envio;
                this.actualizarUI();
            }
        });
    }

    // Agregar producto al carrito
    agregar(producto, boton = null) {
        if (!producto || !producto.id || !producto.nombre || !producto.precio) {
            console.error('❌ Producto inválido:', producto);
            this.mostrarNotificacion('Error al agregar producto', 'error');
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
        this.mostrarNotificacion(`✓ ${producto.nombre} agregado`, 'success');
        
        if (boton) {
            this.animarBoton(boton);
        }
    }

    // Animar botón después de agregar
    animarBoton(boton) {
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

    // Eliminar producto
    eliminar(id) {
        const producto = this.items.find(item => item.id === id);
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
        if (producto) {
            this.mostrarNotificacion(`✗ ${producto.nombre} eliminado`, 'warning');
        }
    }

    // Vaciar carrito
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

    // Calcular total con envío
    getTotal() {
        const subtotal = this.getSubtotal();
        const costoEnvio = this.envio.metodo !== 'retiro' ? this.envio.costo : 0;
        return subtotal + costoEnvio;
    }

    // Verificar si aplica envío gratis
    getEnvioGratis() {
        return this.getSubtotal() >= 15000;
    }

    // Guardar en localStorage
    guardar() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarUI();
        window.dispatchEvent(new CustomEvent('carrito-actualizado', { 
            detail: { items: this.items, total: this.getTotal() }
        }));
    }

    // Guardar datos de envío
    guardarDatosEnvio() {
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

        localStorage.setItem('envio', JSON.stringify(this.envio));
        this.actualizarUI();
        this.mostrarNotificacion('Datos de envío guardados', 'success');
    }

    // Mostrar formulario de envío
    mostrarFormularioEnvio() {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;

        const envioGratis = this.getEnvioGratis() ? ' (¡Envío gratis disponible!)' : '';

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
                            <span class="shipping-price">${this.getEnvioGratis() ? 'Gratis' : '$1.200'}</span>
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
                
                <div class="shipping-details" id="shippingDetails">
                    <h4>Datos de contacto y entrega</h4>
                    
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
                    <button class="save-shipping btn-save">Guardar datos de envío</button>
                    <button class="cancel-shipping btn-cancel" onclick="carrito.actualizarUI()">Cancelar</button>
                </div>
            </div>
        `;

        // Eventos para cambiar método
        document.querySelectorAll('input[name="shipping-method"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const isRetiro = radio.value === 'retiro';
                document.getElementById('shippingDetails').style.opacity = isRetiro ? '0.5' : '1';
                document.querySelectorAll('.shipping-option').forEach(opt => {
                    opt.classList.toggle('selected', opt.querySelector('input').checked);
                });
            });
        });

        // Disparar evento inicial
        const retiroChecked = document.querySelector('input[name="shipping-method"]:checked')?.value === 'retiro';
        if (retiroChecked) {
            document.getElementById('shippingDetails').style.opacity = '0.5';
        }
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
        const cartFooter = document.querySelector('.cart-footer');
        
        if (!cartItems || !cartFooter) return;
        
        // Renderizar items
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Tu carrito está vacío</p>
                    <a href="tienda.html" class="btn-empty" onclick="carrito.toggleCart(); return false;">Explorar productos</a>
                </div>
            `;
            
            // Footer vacío
            cartFooter.innerHTML = `
                <div class="subtotal">
                    <span>Subtotal</span>
                    <span>$0</span>
                </div>
                <p class="empty-message">Agregá productos para continuar</p>
            `;
            return;
        }

        // Mostrar items del carrito
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

        // Actualizar subtotal
        if (subtotalSpan) {
            subtotalSpan.textContent = `$${this.getSubtotal().toLocaleString('es-AR')}`;
        }

        // Renderizar footer con envío
        const envioGratis = this.getEnvioGratis();
        const costoEnvio = envioGratis ? 0 : (this.envio.metodo === 'express' ? 2500 : 1200);
        const total = this.getTotal();

        // Verificar si ya hay datos de envío
        const tieneEnvio = this.envio.nombre && this.envio.direccion;

        if (tieneEnvio) {
            // Mostrar resumen de envío
            cartFooter.innerHTML = `
                <div class="shipping-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>$${this.getSubtotal().toLocaleString('es-AR')}</span>
                    </div>
                    <div class="summary-row shipping-cost">
                        <span>Envío (${this.envio.metodo === 'retiro' ? 'Retiro' : this.envio.metodo === 'express' ? 'Express' : 'Estándar'})</span>
                        <span>${costoEnvio === 0 ? 'Gratis' : '$' + costoEnvio.toLocaleString('es-AR')}</span>
                    </div>
                    <div class="summary-row total">
                        <span><strong>TOTAL</strong></span>
                        <span><strong>$${total.toLocaleString('es-AR')}</strong></span>
                    </div>
                    
                    <div class="shipping-details-summary">
                        <h4>Datos de entrega</h4>
                        <p><i class="fas fa-user"></i> ${this.envio.nombre}</p>
                        <p><i class="fas fa-phone"></i> ${this.envio.telefono}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${this.envio.direccion}, ${this.envio.ciudad} (CP ${this.envio.codigoPostal})</p>
                        ${this.envio.instrucciones ? `<p><i class="fas fa-info-circle"></i> ${this.envio.instrucciones}</p>` : ''}
                        <button class="edit-shipping btn-link">Editar datos de envío</button>
                    </div>
                    
                    <div class="payment-options">
                        <button class="payment-btn mercadopago-btn" onclick="carrito.pagarConMercadoPago()">
                            <i class="fab fa-mercadopago"></i>
                            Pagar con Mercado Pago
                        </button>
                        
                        <button class="payment-btn whatsapp-btn" onclick="carrito.pagarConWhatsApp()">
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
            // Mostrar botón para agregar envío
            cartFooter.innerHTML = `
                <div class="subtotal">
                    <span>Subtotal</span>
                    <span>$${this.getSubtotal().toLocaleString('es-AR')}</span>
                </div>
                
                <div class="shipping-alert">
                    <i class="fas fa-truck"></i>
                    <p>Agregá tus datos de envío para continuar</p>
                </div>
                
                <button class="show-shipping-form btn-shipping">
                    <i class="fas fa-truck"></i>
                    Agregar datos de envío
                </button>
                
                ${envioGratis ? '<p class="free-shipping-note">✨ Comprás más de $15.000 y tenés envío gratis</p>' : ''}
            `;
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
            icono.className = 'fas fa-exclamation-triangle';
            icono.style.color = '#ffaa00';
        } else {
            icono.className = 'fas fa-info-circle';
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
        
        // Si se abre y tiene items pero no tiene envío, mostrar footer normal
        if (panel.classList.contains('open') && this.items.length > 0) {
            this.actualizarUI();
        }
    }

    // ===== OPCIONES DE PAGO =====

    pagarConWhatsApp() {
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }

        if (!this.envio.nombre || !this.envio.direccion) {
            this.mostrarFormularioEnvio();
            this.mostrarNotificacion('Completá tus datos de envío', 'warning');
            return;
        }
        
        const whatsappNumber = '5493511234567'; // ¡CAMBIAR POR EL NÚMERO REAL!
        
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

    // ===== NUEVA FUNCIÓN DE PAGO CON MERCADO PAGO =====
    pagarConMercadoPago() {
        // 1. Validar que el carrito no esté vacío
        if (this.items.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'warning');
            return;
        }

        // 2. Validar que tenga los datos de envío (opcional - podés comentar estas líneas si no querés pedirlo)
        if (!this.envio.nombre || !this.envio.direccion) {
            this.mostrarFormularioEnvio();
            this.mostrarNotificacion('Completá tus datos de envío para generar el pago', 'warning');
            return;
        }

        // 3. Calcular el total final (productos + envío)
        const total = this.getTotal();

        // 4. Formatear el monto para el link de MP:
        //    - Convertimos el número a string
        //    - Eliminamos el separador de miles (el punto) si existe
        //    - Ejemplo: "$15.999" se convierte en "15999"
        const montoParaLink = total.toString().replace(/\./g, '');

        // 5. Construir el link de pago con el monto
        //    IMPORTANTE: Verificá que 'baraandco' sea el identificador correcto de tu link
        const linkMP = `https://link.mercadopago.com.ar/baraandco?amount=${montoParaLink}`;

        // 6. Abrir el link en una nueva pestaña
        window.open(linkMP, '_blank');

        // 7. Mensaje de confirmación
        this.mostrarNotificacion('Serás redirigido a Mercado Pago', 'info');

        // 8. Opcional: Preguntar si quiere vaciar el carrito después del pago
        // setTimeout(() => {
        //     if (confirm('¿Querés vaciar el carrito?')) {
        //         this.vaciar();
        //     }
        // }, 1000);
    }
}

// ===== INICIALIZACIÓN =====
let carrito;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        carrito = new Carrito();
        window.carrito = carrito;
        console.log('🛒 Carrito inicializado con envío y Mercado Pago');
    });
} else {
    carrito = new Carrito();
    window.carrito = carrito;
    console.log('🛒 Carrito inicializado con envío y Mercado Pago');
}

// Funciones globales
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
