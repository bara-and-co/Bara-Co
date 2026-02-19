// Clase Página de Producto
class PaginaProducto {
    constructor() {
        this.producto = null;
        this.talleSeleccionado = null;
        this.cantidad = 1;
        this.init();
    }
    
    init() {
        // Obtener ID de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
            window.location.href = 'tienda.html';
            return;
        }
        
        this.cargarProducto(id);
        this.initEventos();
    }
    
    cargarProducto(id) {
        // Base de datos de productos (misma que en tienda)
        const productos = {
            '1': {
                id: '1',
                nombre: 'Remera Oversize',
                precio: 7999,
                precioOriginal: null,
                descripcion: 'Remera de corte oversize en algodón 24/1 peinado. Diseño relaxed fit, ideal para looks urbanos. Confort y estilo en una sola prenda.',
                composicion: '100% Algodón',
                cuidado: 'Lavar a máquina max. 30°C. No usar blanqueador. Planchar a baja temperatura.',
                imagenes: [
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L', 'XL'],
                colores: ['Negro', 'Blanco', 'Gris'],
                categoria: 'mujer',
                sku: 'REM-001'
            },
            '2': {
                id: '2',
                nombre: 'Jean Holgado',
                precio: 15999,
                precioOriginal: null,
                descripcion: 'Jean de corte holgado en denim premium. Tiro medio, cintura ajustable con botones internos. Ideal para looks urbanos.',
                composicion: '98% Algodón, 2% Elastano',
                cuidado: 'Lavar del revés. No usar secadora.',
                imagenes: [
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L', 'XL'],
                colores: ['Azul Claro', 'Azul Oscuro', 'Negro'],
                categoria: 'mujer',
                sku: 'JN-002'
            },
            '3': {
                id: '3',
                nombre: 'Campera Jean',
                precio: 22999,
                precioOriginal: 28999,
                descripcion: 'Campera de jean oversized con lavado stone. Botones metálicos, bolsillos delanteros y traseros. Elástico en la espalda para mejor ajuste.',
                composicion: '100% Algodón',
                cuidado: 'Lavar a máquina max. 30°C. No usar secadora.',
                imagenes: [
                    'https://images.unsplash.com/photo-1524592001865-b32997a13083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1524592001865-b32997a13083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1524592001865-b32997a13083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L'],
                colores: ['Celeste', 'Azul', 'Negro'],
                categoria: 'unisex',
                sku: 'CJ-003'
            }
        };
        
        this.producto = productos[id];
        
        if (!this.producto) {
            window.location.href = 'tienda.html';
            return;
        }
        
        this.renderizar();
    }
    
    renderizar() {
        // Actualizar título
        document.title = `${this.producto.nombre} · Bara & Co`;
        
        // Renderizar galería
        this.renderizarGaleria();
        
        // Renderizar información
        this.renderizarInfo();
        
        // Renderizar productos relacionados
        this.renderizarRelacionados();
    }
    
    renderizarGaleria() {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.getElementById('thumbnails');
        
        if (mainImage) {
            mainImage.innerHTML = `<img src="${this.producto.imagenes[0]}" alt="${this.producto.nombre}">`;
        }
        
        if (thumbnails) {
            let html = '';
            this.producto.imagenes.forEach((img, index) => {
                html += `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="paginaProducto.cambiarImagen('${img}', this)">
                        <img src="${img}" alt="${this.producto.nombre} - vista ${index + 1}">
                    </div>
                `;
            });
            thumbnails.innerHTML = html;
        }
    }
    
    renderizarInfo() {
        const info = document.getElementById('productInfo');
        if (!info) return;
        
        const descuento = this.producto.precioOriginal ? 
            Math.round((1 - this.producto.precio / this.producto.precioOriginal) * 100) : 0;
        
        let tallesHtml = '';
        this.producto.talles.forEach(talle => {
            tallesHtml += `
                <button class="size-btn" onclick="paginaProducto.seleccionarTalle('${talle}')">${talle}</button>
            `;
        });
        
        info.innerHTML = `
            <div class="product-category">${this.producto.categoria}</div>
            <h1 class="product-title">${this.producto.nombre}</h1>
            <div class="product-price">
                ${this.producto.precioOriginal ? 
                    `<s>$${this.producto.precioOriginal.toLocaleString('es-AR')}</s> 
                     $${this.producto.precio.toLocaleString('es-AR')}
                     <span class="discount-badge">-${descuento}%</span>` 
                    : `$${this.producto.precio.toLocaleString('es-AR')}`}
            </div>
            
            <div class="product-description">
                ${this.producto.descripcion}
            </div>
            
            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">SKU:</span>
                    <span class="detail-value">${this.producto.sku}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Composición:</span>
                    <span class="detail-value">${this.producto.composicion}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cuidado:</span>
                    <span class="detail-value">${this.producto.cuidado}</span>
                </div>
            </div>
            
            <div class="product-options">
                <div class="option-label">
                    Talle <span id="selectedTalle" class="selected-option"></span>
                </div>
                <div class="size-selector" id="sizeSelector">
                    ${tallesHtml}
                </div>
                
                <div class="option-label">Cantidad</div>
                <div class="quantity-selector">
                    <div class="qty-control">
                        <button onclick="paginaProducto.cambiarCantidad(-1)">−</button>
                        <input type="text" id="quantity" value="1" readonly>
                        <button onclick="paginaProducto.cambiarCantidad(1)">+</button>
                    </div>
                </div>
                
                <button class="add-to-cart-btn" onclick="paginaProducto.agregarAlCarrito()">
                    <i class="fas fa-shopping-bag"></i>
                    AGREGAR AL CARRITO
                </button>
                
                <button class="whatsapp-btn" onclick="paginaProducto.consultarWhatsApp()">
                    <i class="fab fa-whatsapp"></i>
                    CONSULTAR POR WHATSAPP
                </button>
            </div>
            
            <div class="product-meta">
                <div class="meta-item">
                    <i class="fas fa-truck"></i>
                    <span>Envíos a todo el país en 24/48hs</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-undo-alt"></i>
                    <span>Cambios gratis dentro de los 30 días</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Compra segura con MercadoPago</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-credit-card"></i>
                    <span>Hasta 6 cuotas sin interés</span>
                </div>
            </div>
        `;
    }
    
    renderizarRelacionados() {
        const container = document.getElementById('relatedProducts');
        if (!container) return;
        
        // Productos relacionados (simulados)
        const relacionados = [
            {
                id: '5',
                nombre: 'Buzo Oversize',
                precio: 12999,
                imagen: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: '6',
                nombre: 'Camisa Oversize',
                precio: 9999,
                imagen: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: '7',
                nombre: 'Pollera',
                precio: 11999,
                imagen: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ];
        
        let html = '';
        relacionados.forEach(p => {
            html += `
                <div class="related-product" onclick="window.location.href='producto.html?id=${p.id}'">
                    <div class="related-image">
                        <img src="${p.imagen}" alt="${p.nombre}">
                    </div>
                    <div class="related-info">
                        <h4>${p.nombre}</h4>
                        <p>$${p.precio.toLocaleString('es-AR')}</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    cambiarImagen(src, thumbnail) {
        document.getElementById('mainImage').innerHTML = `<img src="${src}" alt="${this.producto.nombre}">`;
        
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }
    
    seleccionarTalle(talle) {
        this.talleSeleccionado = talle;
        
        document.querySelectorAll('.size-btn').forEach(btn => {
            if (btn.textContent === talle) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        
        const selectedSpan = document.getElementById('selectedTalle');
        if (selectedSpan) {
            selectedSpan.textContent = `- ${talle}`;
        }
    }
    
    cambiarCantidad(delta) {
        const input = document.getElementById('quantity');
        let nueva = parseInt(input.value) + delta;
        if (nueva >= 1 && nueva <= 10) {
            input.value = nueva;
            this.cantidad = nueva;
        }
    }
    
    agregarAlCarrito() {
        if (!this.talleSeleccionado) {
            alert('Por favor seleccioná un talle');
            return;
        }
        
        // Agregar múltiples veces según cantidad
        for (let i = 0; i < this.cantidad; i++) {
            window.carrito?.agregar({
                id: `${this.producto.id}-${this.talleSeleccionado}`,
                nombre: `${this.producto.nombre} (Talle ${this.talleSeleccionado})`,
                precio: this.producto.precio,
                imagen: this.producto.imagenes[0]
            });
        }
    }
    
    consultarWhatsApp() {
        const mensaje = `Hola! Quiero consultar por ${this.producto.nombre}`;
        const numero = '5493511234567'; // Cambiar por el real
        window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
    }
}

// Inicializar
const paginaProducto = new PaginaProducto();
