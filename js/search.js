class Buscador {
    constructor() {
        this.input = document.querySelector('.header-icons .fa-search');
        this.modal = null;
        this.init();
    }
    
    init() {
        if (!this.input) return;
        
        this.input.addEventListener('click', () => this.abrirModal());
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal) {
                this.cerrarModal();
            }
        });
    }
    
    abrirModal() {
        // Crear modal si no existe
        if (this.modal) {
            this.modal.style.display = 'flex';
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
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Agregar estilos
        const style = document.createElement('style');
        style.textContent = `
            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                z-index: 2000;
                display: none;
            }
            
            .search-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            
            .search-container {
                position: relative;
                background: white;
                width: 90%;
                max-width: 600px;
                margin-top: 100px;
                padding: 30px;
                border-radius: 0;
                box-shadow: 0 30px 60px rgba(0,0,0,0.2);
                animation: slideDown 0.4s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .search-header h2 {
                font-family: var(--font-serif);
                font-size: 1.8rem;
            }
            
            .search-header i {
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .search-input-wrapper {
                position: relative;
                margin-bottom: 20px;
            }
            
            .search-input-wrapper input {
                width: 100%;
                padding: 15px 50px 15px 20px;
                border: 1px solid #ddd;
                font-size: 1rem;
                transition: all 0.3s;
            }
            
            .search-input-wrapper input:focus {
                outline: none;
                border-color: var(--color-accent);
            }
            
            .search-input-wrapper i {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
            }
            
            .search-results {
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 20px;
            }
            
            .search-suggestions p {
                color: #666;
                margin-bottom: 10px;
                font-size: 0.9rem;
            }
            
            .suggestion-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .suggestion-tags span {
                padding: 8px 16px;
                background: var(--color-bg-secondary);
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.9rem;
            }
            
            .suggestion-tags span:hover {
                background: var(--color-accent);
                color: white;
            }
            
            .search-result-item {
                display: flex;
                gap: 15px;
                padding: 10px;
                cursor: pointer;
                transition: all 0.3s;
                border-bottom: 1px solid #eee;
            }
            
            .search-result-item:hover {
                background: #f9f9f9;
            }
            
            .search-result-item img {
                width: 60px;
                height: 60px;
                object-fit: cover;
            }
            
            .search-result-info h4 {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .search-result-info p {
                color: var(--color-accent);
                font-weight: 600;
            }
        `;
        
        document.head.appendChild(style);
        
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
        
        // Simular búsqueda (en versión real, tendrías un array de productos)
        const productos = [
            { id: 1, nombre: 'Remera Oversize', precio: 7999, imagen: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b', categoria: 'remera' },
            { id: 2, nombre: 'Jean Holgado', precio: 15999, imagen: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', categoria: 'jean' },
            { id: 3, nombre: 'Campera Jean', precio: 22999, imagen: 'https://images.unsplash.com/photo-1524592001865-b32997a13083', categoria: 'campera' }
        ];
        
        const resultados = productos.filter(p => 
            p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            p.categoria.includes(termino.toLowerCase())
        );
        
        const resultsDiv = document.getElementById('searchResults');
        
        if (resultados.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No se encontraron productos</p>';
            return;
        }
        
        let html = '';
        resultados.forEach(p => {
            html += `
                <div class="search-result-item" onclick="window.location.href='producto.html?id=${p.id}'">
                    <img src="${p.imagen}" alt="${p.nombre}">
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
