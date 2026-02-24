/**
 * producto.js — Bara & Co
 * Lógica específica para la Página de Detalle de Producto (PDP)
 * Carga dinámica desde productos.json + UX Audit Fixes
 */

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    API_URL: 'productos.json',
    WHATSAPP_NUMBER: '5491112345678', // ⚠️ CAMBIAR POR TU NÚMERO REAL
    FREE_SHIPPING_THRESHOLD: 80000,
    LOW_STOCK_THRESHOLD: 5
};

// ========== ESTADO ==========
let productsData = [];
let currentProduct = null;

// ========== UTILIDADES ==========
const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
}).format(price);

const getProductIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('sku');
};

// ========== CARGA DE DATOS ==========
async function loadProducts() {
    try {
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error('Error al cargar productos');
        productsData = await response.json();
        return productsData;
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        return [];
    }
}

const getProductById = (id) => productsData.find(p => p.id === id || p.sku === id);

// ========== SEO & META TAGS ==========
function updateProductMeta(product) {
    const title = `${product.nombre} — Bara & Co | ${formatPrice(product.precio)}`;
    document.title = title;
    
    // Meta descripción
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', product.descripcion || `Comprá ${product.nombre} en Bara & Co`);
    
    // Open Graph (para Instagram/WhatsApp)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDesc) ogDesc.setAttribute('content', product.descripcion || 'Indumentaria urbana');
    if (ogImage) ogImage.setAttribute('content', product.imagen);
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
}

// ========== RENDERIZADO DE PRODUCTO ==========
function renderProduct(product) {
    if (!product) {
        document.getElementById('product-title').textContent = 'Producto no encontrado';
        document.getElementById('btn-add-cart').disabled = true;
        return;
    }
    
    currentProduct = product;
    
    // 1. Textos básicos
    document.getElementById('product-title').textContent = product.nombre;
    document.getElementById('current-price').textContent = formatPrice(product.precio);
    
    // 2. Precio anterior y descuento
    const oldPriceEl = document.getElementById('old-price');
    const discountEl = document.getElementById('discount-badge');
    
    if (product.precioAnterior && product.precioAnterior > product.precio) {
        oldPriceEl.textContent = formatPrice(product.precioAnterior);
        oldPriceEl.style.display = 'inline';
        const discount = Math.round(((product.precioAnterior - product.precio) / product.precioAnterior) * 100);
        discountEl.textContent = `-${discount}%`;
        discountEl.style.display = 'inline';
    } else {
        oldPriceEl.style.display = 'none';
        discountEl.style.display = 'none';
    }
    
    // 3. Stock (UX Audit: Visibilidad inmediata)
    updateStockStatus(product);
    
    // 4. Imágenes
    const mainImage = document.getElementById('main-image');
    mainImage.src = product.imagen;
    mainImage.alt = product.nombre;
    renderThumbnails(product);
    
    // 5. Talles
    renderSizeOptions(product);
    
    // 6. Colores (si aplica)
    if (product.colores && product.colores.length > 0) {
        renderColorOptions(product);
    }
    
    // 7. Detalles (Composición, Cuidados)
    document.getElementById('prod-composicion').textContent = product.composicion || 'Algodón 95%, Elastano 5%';
    document.getElementById('prod-cuidado').textContent = product.cuidado || 'Lavar con colores similares';
    
    // 8. SEO
    updateProductMeta(product);
    
    // 9. Breadcrumb
    updateBreadcrumb(product);
    
    // 10. Relacionados
    renderRelatedProducts(product);
}

// ========== STOCK STATUS (UX Audit) ==========
function updateStockStatus(product) {
    const stockDot = document.getElementById('stock-dot');
    const stockText = document.getElementById('stock-text');
    const btnAddCart = document.getElementById('btn-add-cart');
    
    // Calcular stock total (simple o por talles)
    const totalStock = product.stock || 0;
    
    if (totalStock === 0) {
        stockDot.className = 'stock-dot out';
        stockText.className = 'stock-text out';
        stockText.textContent = 'Agotado';
        btnAddCart.disabled = true;
        btnAddCart.innerHTML = '<i class="fas fa-times"></i><span>Sin stock</span>';
    } else if (totalStock <= CONFIG.LOW_STOCK_THRESHOLD) {
        // Urgency: "Quedan X unidades"
        stockDot.className = 'stock-dot low';
        stockText.className = 'stock-text';
        stockText.textContent = `¡Últimas ${totalStock} unidades!`;
        btnAddCart.disabled = false;
    } else {
        stockDot.className = 'stock-dot';
        stockText.className = 'stock-text';
        stockText.textContent = 'Disponible';
        btnAddCart.disabled = false;
    }
}

// ========== GALERÍA ==========
function renderThumbnails(product) {
    const grid = document.getElementById('thumbnail-grid');
    const mainImage = document.getElementById('main-image');
    const images = product.imagenes || [product.imagen];
    
    grid.innerHTML = images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img}" alt="${product.nombre}" loading="lazy">
        </div>
    `).join('');
    
    grid.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImage.src = images[this.dataset.index];
            grid.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ========== SELECTORES ==========
function renderSizeOptions(product) {
    const container = document.getElementById('size-options');
    const talles = product.tallesDisponibles || product.talles || [];
    
    if (!talles.length) {
        container.innerHTML = '<span style="color:var(--color-text-secondary)">Consultar talles</span>';
        return;
    }
    
    container.innerHTML = talles.map(talle => `
        <button class="size-btn" data-size="${talle}">${talle}</button>
    `).join('');
    
    container.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function renderColorOptions(product) {
    const container = document.getElementById('color-options');
    document.getElementById('color-group').style.display = 'block';
    
    container.innerHTML = product.colores.map((color, i) => `
        <button class="color-btn ${i===0?'selected':''}" 
                style="background:${color.codigo || '#000'}" 
                title="${color.nombre}"></button>
    `).join('');
}

// ========== BREADCRUMB ==========
function updateBreadcrumb(product) {
    const bcCat = document.getElementById('bc-category');
    const bcProd = document.getElementById('bc-product');
    if (bcCat && product.categoria) {
        bcCat.textContent = product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1);
        bcCat.href = `tienda.html?categoria=${product.categoria}`;
    }
    if (bcProd) bcProd.textContent = product.nombre;
}

// ========== RELACIONADOS ==========
function renderRelatedProducts(current) {
    const container = document.getElementById('related-grid');
    const related = productsData
        .filter(p => p.categoria === current.categoria && p.id !== current.id && p.stock > 0)
        .slice(0, 4);
    
    if (!related.length) {
        container.parentElement.style.display = 'none';
        return;
    }
    
    container.innerHTML = related.map(p => `
        <div class="product-card">
            <a href="producto.html?id=${p.id}">
                <div style="aspect-ratio:3/4;background:var(--color-bg);border-radius:var(--border-radius);overflow:hidden;margin-bottom:12px">
                    <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
                </div>
                <h4 style="font-size:14px;font-weight:400">${p.nombre}</h4>
                <p style="color:var(--color-accent);font-weight:600">${formatPrice(p.precio)}</p>
            </a>
        </div>
    `).join('');
}

// ========== CARRITO & WHATSAPP ==========
function setupActions() {
    // WhatsApp
    const btnWa = document.getElementById('btn-whatsapp');
    if (btnWa && currentProduct) {
        btnWa.addEventListener('click', () => {
            const msg = `Hola! Me interesa: ${currentProduct.nombre} (${currentProduct.sku})`;
            window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }
    
    // Add to Cart
    const btnCart = document.getElementById('btn-add-cart');
    if (btnCart) {
        btnCart.addEventListener('click', () => {
            const size = document.querySelector('.size-btn.selected');
            if (!size) {
                alert('Por favor seleccioná un talle');
                return;
            }
            if (btnCart.disabled) return;
            
            // Lógica simple de carrito (localStorage)
            let cart = JSON.parse(localStorage.getItem('bara-cart')) || [];
            cart.push({
                id: currentProduct.id,
                nombre: currentProduct.nombre,
                precio: currentProduct.precio,
                imagen: currentProduct.imagen,
                size: size.dataset.size,
                quantity: 1
            });
            localStorage.setItem('bara-cart', JSON.stringify(cart));
            
            // Actualizar badge del header
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = cart.length;
                badge.style.display = 'grid';
            }
            
            alert('✅ Agregado al carrito');
        });
    }
}

// ========== MODALES ==========
function setupModals() {
    // Size Guide
    const modal = document.getElementById('size-guide-modal');
    const link = document.getElementById('size-guide-link');
    const close = document.getElementById('size-guide-close');
    
    if (link && modal) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }
    if (close && modal) {
        close.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
    
    // Image Zoom
    const mainImgContainer = document.getElementById('main-image-container');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImg = document.getElementById('zoom-image');
    
    if (mainImgContainer && zoomModal) {
        mainImgContainer.addEventListener('click', () => {
            zoomImg.src = document.getElementById('main-image').src;
            zoomModal.classList.add('active');
        });
        zoomModal.addEventListener('click', () => zoomModal.classList.remove('active'));
    }
}

// ========== INICIALIZAR ==========
async function init() {
    await loadProducts();
    const id = getProductIdFromUrl();
    if (id) {
        const product = getProductById(id);
        renderProduct(product);
        setupActions();
        setupModals();
    }
}

document.addEventListener('DOMContentLoaded', init);
