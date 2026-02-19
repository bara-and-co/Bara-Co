// Social Proof - Notificaciones de compras recientes
class SocialProof {
    constructor() {
        this.comprasRecientes = [
            { producto: 'Remera Oversize', ciudad: 'Córdoba', hace: '5 minutos' },
            { producto: 'Jean Holgado', ciudad: 'Buenos Aires', hace: '15 minutos' },
            { producto: 'Campera Jean', ciudad: 'Rosario', hace: '25 minutos' },
            { producto: 'Buzo Oversize', ciudad: 'Mendoza', hace: '35 minutos' },
            { producto: 'Vestido Negro', ciudad: 'Mar del Plata', hace: '45 minutos' }
        ];
        
        this.intervalo = null;
        this.init();
    }
    
    init() {
        this.mostrarNotificacionAleatoria();
        this.intervalo = setInterval(() => this.mostrarNotificacionAleatoria(), 30000); // Cada 30 segundos
    }
    
    mostrarNotificacionAleatoria() {
        const random = Math.floor(Math.random() * this.comprasRecientes.length);
        const compra = this.comprasRecientes[random];
        
        // Crear elemento
        const notif = document.createElement('div');
        notif.className = 'recent-purchases';
        notif.innerHTML = `
            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="compra">
            <div class="recent-purchases-info">
                <p><span>${compra.ciudad}</span> compró <strong>${compra.producto}</strong></p>
                <div class="recent-purchases-time">hace ${compra.hace}</div>
            </div>
        `;
        
        document.body.appendChild(notif);
        
        // Eliminar después de 5 segundos
        setTimeout(() => {
            notif.style.animation = 'slideOut 0.5s ease forwards';
            setTimeout(() => notif.remove(), 500);
        }, 5000);
    }
}

// Inicializar solo en páginas que no sean admin
if (!window.location.pathname.includes('admin')) {
    const socialProof = new SocialProof();
}

// Estadísticas dinámicas
function initStats() {
    const stats = {
        compras: 1247,
        clientes: 892,
        opiniones: 156,
        envios: 1247
    };
    
    function animateNumber(element, target) {
        let current = 0;
        const increment = target / 50;
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(interval);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    }
    
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((el, index) => {
        const target = Object.values(stats)[index];
        animateNumber(el, target);
    });
}

// Reseñas aleatorias
const reviews = [
    {
        nombre: 'María G.',
        texto: 'La calidad es increíble, superó mis expectativas. Ya estoy pensando en mi próxima compra.',
        estrellas: 5,
        producto: 'Remera Oversize'
    },
    {
        nombre: 'Javier M.',
        texto: 'Excelente atención y el jean me quedó perfecto. Recomiendo 100%',
        estrellas: 5,
        producto: 'Jean Holgado'
    },
    {
        nombre: 'Lucía P.',
        texto: 'La campera es hermosísima, tal cual la foto. Llegó antes de lo esperado.',
        estrellas: 5,
        producto: 'Campera Jean'
    }
];

function renderReviews() {
    const container = document.getElementById('reviewsGrid');
    if (!container) return;
    
    let html = '';
    reviews.forEach(r => {
        let stars = '';
        for (let i = 0; i < r.estrellas; i++) {
            stars += '★';
        }
        
        html += `
            <div class="review-card">
                <div class="review-stars">${stars}</div>
                <p class="review-text">"${r.texto}"</p>
                <div class="review-author">${r.nombre}</div>
                <div class="review-verified">✓ Compra verificada · ${r.producto}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.stats-grid')) {
        initStats();
    }
    if (document.getElementById('reviewsGrid')) {
        renderReviews();
    }
});
