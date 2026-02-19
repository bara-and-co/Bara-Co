// ADMINISTRACIÓN DE PRODUCTOS
// Este archivo maneja la lógica para agregar/editar/eliminar productos
// Solo accesible para administradores

class AdminProductos {
    constructor() {
        this.productos = JSON.parse(localStorage.getItem('productos')) || this.productosIniciales();
        this.usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
        
        // Verificar si es admin
        if (!this.usuarioActual || this.usuarioActual.rol !== 'admin') {
            if (window.location.pathname.includes('admin')) {
                window.location.href = 'login.html?redirect=admin';
            }
            return;
        }
        
        this.init();
    }
    
    productosIniciales() {
        return [
            {
                id: '1',
                nombre: 'Remera Oversize',
                precio: 7999,
                precioOriginal: null,
                descripcion: 'Remera de corte oversize en algodón 24/1 peinado. Diseño relaxed fit, ideal para looks urbanos.',
                composicion: '100% Algodón',
                cuidado: 'Lavar a máquina max. 30°C',
                imagenes: [
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L', 'XL'],
                categoria: 'mujer',
                etiqueta: 'nuevo',
                sku: 'REM-001',
                stock: 50,
                fecha: new Date().toISOString()
            },
            {
                id: '2',
                nombre: 'Jean Holgado',
                precio: 15999,
                precioOriginal: null,
                descripcion: 'Jean de corte holgado en denim premium. Tiro medio, cintura ajustable.',
                composicion: '98% Algodón, 2% Elastano',
                cuidado: 'Lavar del revés',
                imagenes: [
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L', 'XL'],
                categoria: 'mujer',
                etiqueta: null,
                sku: 'JN-002',
                stock: 35,
                fecha: new Date().toISOString()
            },
            {
                id: '3',
                nombre: 'Campera Jean',
                precio: 22999,
                precioOriginal: 28999,
                descripcion: 'Campera de jean oversized con lavado stone. Botones metálicos.',
                composicion: '100% Algodón',
                cuidado: 'Lavar a máquina',
                imagenes: [
                    'https://images.unsplash.com/photo-1524592001865-b32997a13083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                talles: ['S', 'M', 'L'],
                categoria: 'unisex',
                etiqueta: 'sale',
                sku: 'CJ-003',
                stock: 20,
                fecha: new Date().toISOString()
            }
        ];
    }
    
    init() {
        // Si estamos en página de admin, cargar la interfaz
        if (document.getElementById('adminPanel')) {
            this.renderizarPanel();
            this.initEventos();
        }
    }
    
    renderizarPanel() {
        const panel = document.getElementById('adminPanel');
        if (!panel) return;
        
        panel.innerHTML = `
            <div class="admin-header">
                <h1>Panel de Administración</h1>
                <button class="btn" onclick="adminProductos.mostrarFormulario()">+ Nuevo Producto</button>
            </div>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-number">${this.productos.length}</div>
                    <div class="stat-label">Productos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.productos.reduce((sum, p) => sum + p.stock, 0)}</div>
                    <div class="stat-label">Stock total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.productos.filter(p => p.etiqueta === 'sale').length}</div>
                    <div class="stat-label">En oferta</div>
                </div>
            </div>
            
            <div class="admin-filters">
                <input type="text" id="searchProducto" placeholder="Buscar producto..." class="admin-search">
                <select id="filterCategoria" class="admin-select">
                    <option value="">Todas las categorías</option>
                    <option value="mujer">Mujer</option>
                    <option value="hombre">Hombre</option>
                    <option value="unisex">Unisex</option>
                    <option value="accesorios">Accesorios</option>
                </select>
                <select id="filterEtiqueta" class="admin-select">
                    <option value="">Todas las etiquetas</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="sale">Sale</option>
                </select>
            </div>
            
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>SKU</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Etiqueta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="productosTableBody">
                        ${this.renderizarTabla()}
                    </tbody>
                </table>
            </div>
            
            <!-- Modal para formulario -->
            <div id="productoModal" class="admin-modal" style="display: none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="adminProductos.cerrarModal()">&times;</span>
                    <div id="modalContent"></div>
                </div>
            </div>
        `;
    }
    
    renderizarTabla(filtros = {}) {
        let productosFiltrados = [...this.productos];
        
        if (filtros.search) {
            productosFiltrados = productosFiltrados.filter(p => 
                p.nombre.toLowerCase().includes(filtros.search.toLowerCase()) ||
                p.sku.toLowerCase().includes(filtros.search.toLowerCase())
            );
        }
        
        if (filtros.categoria) {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === filtros.categoria);
        }
        
        if (filtros.etiqueta) {
            productosFiltrados = productosFiltrados.filter(p => p.etiqueta === filtros.etiqueta);
        }
        
        return productosFiltrados.map(p => `
            <tr>
                <td><img src="${p.imagenes[0]}" alt="${p.nombre}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                <td>${p.sku}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precio.toLocaleString('es-AR')}${p.precioOriginal ? `<br><small>Antes: $${p.precioOriginal}</small>` : ''}</td>
                <td>${p.stock}</td>
                <td>${p.etiqueta ? `<span class="badge ${p.etiqueta}">${p.etiqueta}</span>` : '-'}</td>
                <td>
                    <button class="btn-small" onclick="adminProductos.editarProducto('${p.id}')">Editar</button>
                    <button class="btn-small btn-danger" onclick="adminProductos.eliminarProducto('${p.id}')">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }
    
    initEventos() {
        const searchInput = document.getElementById('searchProducto');
        const filterCategoria = document.getElementById('filterCategoria');
        const filterEtiqueta = document.getElementById('filterEtiqueta');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.aplicarFiltros());
        }
        
        if (filterCategoria) {
            filterCategoria.addEventListener('change', () => this.aplicarFiltros());
        }
        
        if (filterEtiqueta) {
            filterEtiqueta.addEventListener('change', () => this.aplicarFiltros());
        }
    }
    
    aplicarFiltros() {
        const filtros = {
            search: document.getElementById('searchProducto')?.value,
            categoria: document.getElementById('filterCategoria')?.value,
            etiqueta: document.getElementById('filterEtiqueta')?.value
        };
        
        const tbody = document.getElementById('productosTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderizarTabla(filtros);
        }
    }
    
    mostrarFormulario(producto = null) {
        const modal = document.getElementById('productoModal');
        const modalContent = document.getElementById('modalContent');
        
        if (producto) {
            modalContent.innerHTML = this.renderizarFormularioEdicion(producto);
        } else {
            modalContent.innerHTML = this.renderizarFormularioNuevo();
        }
        
        modal.style.display = 'block';
    }
    
    renderizarFormularioNuevo() {
        return `
            <h2>Nuevo Producto</h2>
            <form id="productoForm" onsubmit="adminProductos.guardarProducto(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>SKU</label>
                        <input type="text" id="sku" required>
                    </div>
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Precio</label>
                        <input type="number" id="precio" required>
                    </div>
                    <div class="form-group">
                        <label>Precio original (si es oferta)</label>
                        <input type="number" id="precioOriginal">
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="categoria" required>
                            <option value="mujer">Mujer</option>
                            <option value="hombre">Hombre</option>
                            <option value="unisex">Unisex</option>
                            <option value="accesorios">Accesorios</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Etiqueta</label>
                        <select id="etiqueta">
                            <option value="">Ninguna</option>
                            <option value="nuevo">Nuevo</option>
                            <option value="sale">Sale</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" id="stock" required>
                    </div>
                    <div class="form-group">
                        <label>Talles (separados por coma)</label>
                        <input type="text" id="talles" placeholder="S,M,L,XL" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="descripcion" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label>URL de imagen principal</label>
                    <input type="url" id="imagen" required>
                </div>
                
                <div class="form-group">
                    <label>URLs de imágenes adicionales (separadas por coma)</label>
                    <input type="text" id="imagenesAdicionales" placeholder="url1,url2,url3">
                </div>
                
                <div class="form-group">
                    <label>Composición</label>
                    <input type="text" id="composicion" required>
                </div>
                
                <div class="form-group">
                    <label>Cuidado</label>
                    <input type="text" id="cuidado" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn">Guardar Producto</button>
                    <button type="button" class="btn-secondary" onclick="adminProductos.cerrarModal()">Cancelar</button>
                </div>
            </form>
        `;
    }
    
    renderizarFormularioEdicion(producto) {
        return `
            <h2>Editar Producto: ${producto.nombre}</h2>
            <form id="productoForm" onsubmit="adminProductos.actualizarProducto(event, '${producto.id}')">
                <div class="form-grid">
                    <div class="form-group">
                        <label>SKU</label>
                        <input type="text" id="sku" value="${producto.sku}" required>
                    </div>
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="nombre" value="${producto.nombre}" required>
                    </div>
                    <div class="form-group">
                        <label>Precio</label>
                        <input type="number" id="precio" value="${producto.precio}" required>
                    </div>
                    <div class="form-group">
                        <label>Precio original</label>
                        <input type="number" id="precioOriginal" value="${producto.precioOriginal || ''}">
                    </div>
                    <div class="form-group">
                        <label>Categoría</label>
                        <select id="categoria" required>
                            <option value="mujer" ${producto.categoria === 'mujer' ? 'selected' : ''}>Mujer</option>
                            <option value="hombre" ${producto.categoria === 'hombre' ? 'selected' : ''}>Hombre</option>
                            <option value="unisex" ${producto.categoria === 'unisex' ? 'selected' : ''}>Unisex</option>
                            <option value="accesorios" ${producto.categoria === 'accesorios' ? 'selected' : ''}>Accesorios</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Etiqueta</label>
                        <select id="etiqueta">
                            <option value="">Ninguna</option>
                            <option value="nuevo" ${producto.etiqueta === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                            <option value="sale" ${producto.etiqueta === 'sale' ? 'selected' : ''}>Sale</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Stock</label>
                        <input type="number" id="stock" value="${producto.stock}" required>
                    </div>
                    <div class="form-group">
                        <label>Talles</label>
                        <input type="text" id="talles" value="${producto.talles.join(',')}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="descripcion" rows="4" required>${producto.descripcion}</textarea>
                </div>
                
                <div class="form-group">
                    <label>URL de imagen principal</label>
                    <input type="url" id="imagen" value="${producto.imagenes[0]}" required>
                </div>
                
                <div class="form-group">
                    <label>Composición</label>
                    <input type="text" id="composicion" value="${producto.composicion}" required>
                </div>
                
                <div class="form-group">
                    <label>Cuidado</label>
                    <input type="text" id="cuidado" value="${producto.cuidado}" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn">Actualizar Producto</button>
                    <button type="button" class="btn-secondary" onclick="adminProductos.cerrarModal()">Cancelar</button>
                </div>
            </form>
        `;
    }
    
    guardarProducto(event) {
        event.preventDefault();
        
        const nuevoProducto = {
            id: Date.now().toString(),
            sku: document.getElementById('sku').value,
            nombre: document.getElementById('nombre').value,
            precio: parseFloat(document.getElementById('precio').value),
            precioOriginal: document.getElementById('precioOriginal').value ? parseFloat(document.getElementById('precioOriginal').value) : null,
            categoria: document.getElementById('categoria').value,
            etiqueta: document.getElementById('etiqueta').value || null,
            stock: parseInt(document.getElementById('stock').value),
            talles: document.getElementById('talles').value.split(',').map(t => t.trim()),
            descripcion: document.getElementById('descripcion').value,
            composicion: document.getElementById('composicion').value,
            cuidado: document.getElementById('cuidado').value,
            imagenes: [document.getElementById('imagen').value],
            fecha: new Date().toISOString()
        };
        
        this.productos.push(nuevoProducto);
        localStorage.setItem('productos', JSON.stringify(this.productos));
        
        this.cerrarModal();
        this.renderizarPanel();
    }
    
    actualizarProducto(event, id) {
        event.preventDefault();
        
        const index = this.productos.findIndex(p => p.id === id);
        if (index === -1) return;
        
        this.productos[index] = {
            ...this.productos[index],
            sku: document.getElementById('sku').value,
            nombre: document.getElementById('nombre').value,
            precio: parseFloat(document.getElementById('precio').value),
            precioOriginal: document.getElementById('precioOriginal').value ? parseFloat(document.getElementById('precioOriginal').value) : null,
            categoria: document.getElementById('categoria').value,
            etiqueta: document.getElementById('etiqueta').value || null,
            stock: parseInt(document.getElementById('stock').value),
            talles: document.getElementById('talles').value.split(',').map(t => t.trim()),
            descripcion: document.getElementById('descripcion').value,
            composicion: document.getElementById('composicion').value,
            cuidado: document.getElementById('cuidado').value,
            imagenes: [document.getElementById('imagen').value]
        };
        
        localStorage.setItem('productos', JSON.stringify(this.productos));
        
        this.cerrarModal();
        this.renderizarPanel();
    }
    
    eliminarProducto(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            this.productos = this.productos.filter(p => p.id !== id);
            localStorage.setItem('productos', JSON.stringify(this.productos));
            this.renderizarPanel();
        }
    }
    
    editarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            this.mostrarFormulario(producto);
        }
    }
    
    cerrarModal() {
        document.getElementById('productoModal').style.display = 'none';
    }
}

// Inicializar
const adminProductos = new AdminProductos();
