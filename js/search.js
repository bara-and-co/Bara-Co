class Buscador {
    constructor() {
        this.input = document.getElementById('searchIcon');
        this.modal = null;
        this.productos = [];
        this.init();
        this.cargarProductos();
    }
    
    async cargarProductos() {
        try {
            const response = await fetch('productos.json?t=' + Date.now());
            if (response.ok) {
                this.productos = await response.json();
                console.log('📦 Productos cargados para búsqueda:', this.productos.length);
            }
        } catch (error) {
            console.warn('No se pudieron cargar productos para búsqueda');
        }
    }
    
    init() {
        if (!this.input) return;
        
        this.input.addEventListener('click', (e) => {
            e.preventDefault();
            this.abrirModal();
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                this.cerrarModal();
            }
        });
    }
    
    abrirModal() {
        // Crear modal si no existe
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.getElementById('searchInput')?.focus();
            return;
        }
        
        this.modal = document.createElement('div');
        this.modal.className = 'search-modal';
        this.modal.innerHTML = `
            <div class="search-overlay" onclick="buscador.cerrarModal()"></div>
            <div class="search-container">
                <div class="search-header">
                    <h2>Buscar productos</h2>
                    <i class="fas fa-times" onclick="buscador.cerrarModal()"></i>
                </div>
                <div class="search-input-wrapper">
                    <input type="text" id="searchInput" placeholder="¿Qué estás buscando?" autocomplete="off">
                    <i class="fas fa-search"></i>
                </div>
                <div class="search-results" id="searchResults"></div>
                <div class="search-suggestions">
                    <p>Sugerencias:</p>
                    <div class="suggestion-tags">
                        <span onclick="buscador.buscar('remera')">Remera</span>
                        <span onclick="buscador.buscar('jean')">Jean</span>
                        <span onclick="buscador.buscar('campera')">Campera</span>
                        <span onclick="buscador.buscar('accesorios')">Accesorios</span>
                        <span onclick="buscador.buscar('hombre')">Hombre</span>
                        <span onclick="buscador.buscar('mujer')">Mujer</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Eventos
        const input = document.getElementById('searchInput');
        input.addEventListener('input', (e) => this.buscar(e.target.value));
        input.focus();
    }
    
    cerrarModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    
    buscar(termino) {
        if (!termino || termino.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
        }
        
        // Buscar en productos.json
        const resultados = this.productos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            (p.categoria && p.categoria.toLowerCase().includes(termino.toLowerCase())) ||
            (p.subcategoria && p.subcategoria.toLowerCase().includes(termino.toLowerCase()))
        ).slice(0, 6); // Mostrar solo 6 resultados
        
        const resultsDiv = document.getElementById('searchResults');
        
        if (resultados.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--color-text-secondary);">No se encontraron productos</p>';
            return;
        }
        
        let html = '';
        resultados.forEach(p => {
            // Determinar la URL base correcta (puede estar en / o en /producto.html)
            const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
            
            html += `
                <div class="search-result-item" onclick="window.location.href='${basePath}producto.html?id=${p.id}'">
                    <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='${basePath}images/placeholder.jpg'">
                    <div class="search-result-info">
                        <h4>${p.nombre}</h4>
                        <p>$${p.precio.toLocaleString('es-AR')}</p>
                    </div>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }
}

// Inicializar
const buscador = new Buscador();
window.buscador = buscador;
