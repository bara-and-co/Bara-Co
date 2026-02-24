/**
 * main.js — Bara & Co
 * Funciones globales + Carga dinámica de productos desde productos.json
 */

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    API_URL: 'productos.json',
    WHATSAPP_NUMBER: '5493525614281', // Reemplazar con tu número real
    FREE_SHIPPING_THRESHOLD: 80000,
    LOW_STOCK_THRESHOLD: 5
};

// ========== ESTADO GLOBAL ==========
let productsData = [];
let cart = JSON.parse(localStorage.getItem('bara-cart')) || [];

// ========== HEADER SCROLL ==========
(function() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
})();

// ========== CURSOR CUSTOM (solo desktop) ==========
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // Código del cursor custom aquí si lo tenés
}

// ========== CARGAR PRODUCTOS DESDE JSON ==========
async function loadProducts() {
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error('Error al cargar productos');
        productsData = await response.json();
        console.log(`✅ ${productsData.length} productos cargados`);
        return productsData;
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        return [];
    }
}

// ========== BUSCAR PRODUCTO POR ID ==========
function getProductById(id) {
    return productsData.find(p => p.id === id || p.sku === id);
}

// ========== OBTENER PRODUCTO DE LA URL ==========
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('sku');
}

// ========== FORMATO DE PRECIO ==========
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(price);
}

// ========== CALCULAR DESCUENTO ==========
function calculateDiscount(current, original) {
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
}

// ========== ACTUALIZAR META TAGS SEO ==========
function updateProductMeta(product) {
    // Título
    const title = `${product.nombre} — Bara & Co | ${formatPrice(product.precio)}`;
    document.title = title;
    document.getElementById('meta-title').textContent = title;
    
    // Descripción
    const desc = product.descripcion || `Comprá ${product.nombre} en Bara & Co. Indumentaria urbana con diseño y confort.`;
    document.getElementById('meta-desc').setAttribute('content', desc);
    
    // Open Graph
    document.getElementById('og-title').setAttribute('content', `${product.nombre} — Bara & Co`);
    document.getElementById('og-desc').setAttribute('content', desc);
    document.getElementById('og-image').setAttribute('content', product.imagen);
    document.getElementById('og-url').setAttribute('content', window.location.href);
}

// ========== ACTUALIZAR BREADCRUMB ==========
function updateBreadcrumb(product) {
    const bcCategory = document.getElementById('bc-category');
    const bcProduct = document.getElementById('bc-product');
    
    if (bcCategory && product.categoria) {
        bcCategory.textContent = product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1);
        bcCategory.href = `tienda.html?categoria=${product.categoria}`;
    }
    
    if (bcProduct) {
        bcProduct.textContent = product.nombre;
    }
}

// ========== RENDERIZAR PRODUCTO EN PDP ==========
function renderProduct(product) {
    if (!product) {
        document.getElementById('product-title').textContent = 'Producto no encontrado';
        return;
    }
    
    // Título y precio
    document.getElementById('product-title').textContent = product.nombre;
    document.getElementById('current-price').textContent = formatPrice(product.precio);
    
    // Precio anterior y descuento
    const oldPriceEl = document.getElementById('old-price');
    const discountEl = document.getElementById('discount-badge');
    
    if (product.precioAnterior && product.precioAnterior > product.precio) {
        oldPriceEl.textContent = formatPrice(product.precioAnterior);
        oldPriceEl.style.display = 'inline';
        
        const discount = calculateDiscount(product.precio, product.precioAnterior);
        discountEl.textContent = `-${discount}%`;
        discountEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
        discountEl.style.display = 'none';
    }
    
    // Stock status
    updateStockStatus(product);
    
    // Imagen principal
    const mainImage = document.getElementById('main-image');
    mainImage.src = product.imagen;
    mainImage.alt = product.nombre;
    
    // Thumbnails
    renderThumbnails(product);
    
    // Talles
    renderSizeOptions(product);
    
    // Colores (si aplica)
    if (product.colores && product.colores.length > 0) {
        renderColorOptions(product);
    }
    
    // Detalles del producto
    document.getElementById('prod-composicion').textContent = 
        product.composicion || 'Algodón 95%, Elastano 5%';
    document.getElementById('prod-cuidado').textContent = 
        product.cuidado || 'Lavar con colores similares, no usar blanqueador';
    
    // Botón WhatsApp
    setupWhatsAppButton(product);
    
    // Actualizar SEO y breadcrumb
    updateProductMeta(product);
    updateBreadcrumb(product);
    
    // Productos relacionados
    renderRelatedProducts(product);
}

// ========== ACTUALIZAR ESTADO DE STOCK ==========
function updateStockStatus(product) {
    const stockDot = document.getElementById('stock-dot');
    const stockText = document.getElementById('stock-text');
    const btnAddCart = document.getElementById('btn-add-cart');
    
    const totalStock = product.stock || 0;
    
    if (totalStock === 0) {
        // Sin stock
        stockDot.className = 'stock-dot out';
        stockText.className = 'stock-text out';
        stockText.textContent = 'Agotado';
        btnAddCart.disabled = true;
        btnAddCart.innerHTML = '<i class="fas fa-times"></i><span>Sin stock</span>';
    } else if (totalStock <= CONFIG.LOW_STOCK_THRESHOLD) {
        // Stock bajo
        stockDot.className = 'stock-dot low';
        stockText.className = 'stock-text';
        stockText.textContent = `¡Últimas ${totalStock} unidades!`;
        btnAddCart.disabled = false;
    } else {
        // Stock normal
        stockDot.className = 'stock-dot';
        stockText.className = 'stock-text';
        stockText.textContent = 'Disponible';
        btnAddCart.disabled = false;
    }
}

// ========== RENDERIZAR THUMBNAILS ==========
function renderThumbnails(product) {
    const grid = document.getElementById('thumbnail-grid');
    const mainImage = document.getElementById('main-image');
    const images = product.imagenes || [product.imagen];
    
    grid.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img}" alt="${product.nombre} ${index + 1}" loading="lazy">
        </div>
    `).join('');
    
    // Click en thumbnail
    grid.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const index = this.dataset.index;
            mainImage.src = images[index];
            
            grid.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ========== RENDERIZAR OPCIONES DE TALLE ==========
function renderSizeOptions(product) {
    const container = document.getElementById('size-options');
    const talles = product.tallesDisponibles || product.talles || [];
    const stockTalles = product.stockTalles || {};
    
    if (talles.length === 0) {
        container.innerHTML = '<span style="color:var(--color-text-secondary);font-size:13px">Consultar talles</span>';
        return;
    }
    
    container.innerHTML = talles.map(talle => {
        const stock = stockTalles[talle] || product.stock || 0;
        const disabled = stock === 0 ? 'disabled' : '';
        const stockInfo = stock <= CONFIG.LOW_STOCK_THRESHOLD && stock > 0 ? `data-stock="${stock}"` : '';
        
        return `
            <button class="size-btn" data-size="${talle}" ${disabled} ${stockInfo}>
                ${talle}
            </button>
        `;
    }).join('');
    
    // Selección de talle
    container.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// ========== RENDERIZAR OPCIONES DE COLOR ==========
function renderColorOptions(product) {
    const container = document.getElementById('color-options');
    const colorGroup = document.getElementById('color-group');
    
    if (!product.colores || product.colores.length === 0) {
        colorGroup.style.display = 'none';
        return;
    }
    
    colorGroup.style.display = 'block';
    
    container.innerHTML = product.colores.map((color, index) => `
        <button class="color-btn ${index === 0 ? 'selected' : ''}" 
                style="background:${color.codigo || '#000'}"
                data-color="${color.nombre}"
                ${color.stock === 0 ? 'disabled' : ''}
                title="${color.nombre}">
        </button>
    `).join('');
    
    // Selección de color
    container.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            container.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// ========== CONFIGURAR BOTÓN WHATSAPP ==========
function setupWhatsAppButton(product) {
    const btn = document.getElementById('btn-whatsapp');
    const message = `Hola! Me interesa el producto: ${product.nombre} (${product.sku})`;
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    btn.addEventListener('click', () => {
        window.open(url, '_blank');
    });
}

// ========== RENDERIZAR PRODUCTOS RELACIONADOS ==========
function renderRelatedProducts(currentProduct) {
    const container = document.getElementById('related-grid');
    
    // Filtrar productos de la misma categoría (excluyendo el actual)
    const related = productsData
        .filter(p => 
            p.categoria === currentProduct.categoria && 
            p.id !== currentProduct.id &&
            p.activo !== false &&
            p.stock > 0
        )
        .slice(0, 4);
    
    if (related.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }
    
    container.innerHTML = related.map(product => `
        <div class="product-card" data-id="${product.id}">
            <a href="producto.html?id=${product.id}" style="text-decoration:none;color:inherit">
                <div style="aspect-ratio:3/4;background:var(--color-bg);border-radius:var(--border-radius);overflow:hidden;margin-bottom:12px">
                    <img src="${product.imagen}" alt="${product.nombre}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
                </div>
                <h4 style="font-size:14px;font-weight:400;margin-bottom:4px">${product.nombre}</h4>
                <p style="color:var(--color-accent);font-weight:600">${formatPrice(product.precio)}</p>
            </a>
        </div>
    `).join('');
}

// ========== CARRITO ==========
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
    localStorage.setItem('bara-cart', JSON.stringify(cart));
}

function addToCart(product, size, quantity = 1) {
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && item.size === size
    );
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            sku: product.sku,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            size: size,
            quantity: quantity
        });
    }
    
    updateCartCount();
    showCartNotification();
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Producto agregado al carrito</span>
    `;
    notification.style.cssText = `
        position:fixed;bottom:100px;right:20px;
        background:var(--color-accent);color:var(--color-bg);
        padding:16px 24px;border-radius:var(--border-radius);
        display:flex;align-items:center;gap:12px;
        animation:slideIn 0.3s ease;z-index:1000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ========== MODAL GUÍA DE TALLES ==========
function setupSizeGuideModal() {
    const modal = document.getElementById('size-guide-modal');
    const link = document.getElementById('size-guide-link');
    const close = document.getElementById('size-guide-close');
    
    if (!modal || !link || !close) return;
    
    link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
    });
    
    close.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ========== MODAL ZOOM DE IMAGEN ==========
function setupImageZoom() {
    const mainImageContainer = document.getElementById('main-image-container');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImage = document.getElementById('zoom-image');
    
    if (!mainImageContainer || !zoomModal) return;
    
    mainImageContainer.addEventListener('click', () => {
        const currentSrc = document.getElementById('main-image').src;
        zoomImage.src = currentSrc;
        zoomModal.classList.add('active');
    });
    
    zoomModal.addEventListener('click', () => {
        zoomModal.classList.remove('active');
    });
}

// ========== INICIALIZAR PÁGINA DE PRODUCTO ==========
async function initProductPage() {
    // Cargar productos
    await loadProducts();
    
    // Obtener ID de la URL
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        console.error('❌ No se encontró ID de producto en la URL');
        return;
    }
    
    // Buscar y renderizar producto
    const product = getProductById(productId);
    
    if (product) {
        renderProduct(product);
        
        // Configurar botón de agregar al carrito
        const btnAddCart = document.getElementById('btn-add-cart');
        btnAddCart.addEventListener('click', () => {
            const selectedSize = document.querySelector('.size-btn.selected');
            
            if (!selectedSize) {
                alert('Por favor seleccioná un talle');
                return;
            }
            
            if (btnAddCart.disabled) {
                alert('Producto sin stock');
                return;
            }
            
            addToCart(product, selectedSize.dataset.size);
        });
    } else {
        document.getElementById('product-title').textContent = 'Producto no encontrado';
        document.getElementById('current-price').textContent = '';
    }
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Configurar modales
    setupSizeGuideModal();
    setupImageZoom();
}

// ========== INICIALIZAR CUANDO EL DOM ESTÉ LISTO ==========
document.addEventListener('DOMContentLoaded', initProductPage);
