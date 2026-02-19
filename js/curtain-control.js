// ===========================================
// CONTROL DEL CURTAIN - BARA & CO
// Evita que el curtain se reproduzca en visitas repetidas
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Solo en la página de inicio
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        return;
    }

    const curtainControl = new CurtainControl();
});

class CurtainControl {
    constructor() {
        this.heroSticky = document.getElementById('heroSticky');
        this.hasVisited = localStorage.getItem('baraCoVisited');
        this.visitCount = parseInt(localStorage.getItem('baraCoVisitCount')) || 0;
        
        this.init();
    }

    init() {
        // Incrementar contador de visitas
        this.visitCount++;
        localStorage.setItem('baraCoVisitCount', this.visitCount.toString());

        // Si es la primera visita, mostrar curtain completo
        if (!this.hasVisited) {
            this.marcarPrimeraVisita();
            this.setupCurtainCompleto();
        } else {
            // Visitas recurrentes - abrir curtain automáticamente
            this.setupCurtainAbrir();
        }

        // Agregar botón para saltar curtain (siempre visible)
        this.agregarSkipButton();
    }

    marcarPrimeraVisita() {
        localStorage.setItem('baraCoVisited', 'true');
        
        // Registrar timestamp de primera visita
        localStorage.setItem('baraCoFirstVisit', new Date().toISOString());
    }

    setupCurtainCompleto() {
        console.log('Primera visita - reproduciendo curtain completo');
        
        // Animación normal del curtain (ya está en el HTML)
        // Solo agregamos un pequeño delay para asegurar que se vea
        setTimeout(() => {
            this.heroSticky?.classList.add('curtain-ready');
        }, 100);
    }

    setupCurtainAbrir() {
        console.log('Visita recurrente - abriendo curtain automáticamente');
        
        // Abrir el curtain suavemente después de 0.5 segundos
        setTimeout(() => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });

            // Disparar evento para actualizar panels
            setTimeout(() => {
                window.dispatchEvent(new Event('scroll'));
            }, 1000);
        }, 500);

        // Mostrar mensaje de bienvenida
        this.mostrarMensajeBienvenida();
    }

    agregarSkipButton() {
        // Solo si el curtain está visible
        if (!this.heroSticky) return;

        const skipBtn = document.createElement('div');
        skipBtn.className = 'skip-curtain';
        skipBtn.innerHTML = `
            <span>Saltar introducción</span>
            <i class="fas fa-arrow-right"></i>
        `;
        
        skipBtn.style.cssText = `
            position: absolute;
            bottom: 120px;
            right: 30px;
            z-index: 100;
            color: white;
            cursor: pointer;
            padding: 12px 24px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 50px;
            font-size: 0.9rem;
            letter-spacing: 1px;
            transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.2);
        `;

        skipBtn.addEventListener('mouseenter', () => {
            skipBtn.style.background = 'rgba(255,255,255,0.2)';
        });

        skipBtn.addEventListener('mouseleave', () => {
            skipBtn.style.background = 'rgba(255,255,255,0.1)';
        });

        skipBtn.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });

        this.heroSticky.appendChild(skipBtn);
    }

    mostrarMensajeBienvenida() {
        const visitas = this.visitCount;
        let mensaje = '';

        if (visitas === 2) {
            mensaje = '¡Bienvenido de nuevo!';
        } else if (visitas === 5) {
            mensaje = '¡Ya sos parte de la familia Bara & Co!';
        } else if (visitas % 10 === 0) {
            mensaje = `¡${visitas} visitas! Gracias por confiar en nosotros.`;
        }

        if (mensaje) {
            const toast = document.createElement('div');
            toast.className = 'welcome-toast';
            toast.innerHTML = `
                <i class="fas fa-heart" style="color: var(--color-accent);"></i>
                <span>${mensaje}</span>
            `;
            
            toast.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--color-text-primary);
                color: white;
                padding: 15px 30px;
                border-radius: 50px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                animation: slideDown 0.5s ease;
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideUp 0.5s ease forwards';
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }
    }

    // Método para reiniciar el estado (útil para testing)
    resetVisita() {
        localStorage.removeItem('baraCoVisited');
        localStorage.removeItem('baraCoVisitCount');
        localStorage.removeItem('baraCoFirstVisit');
        window.location.reload();
    }
}

// Agregar animaciones CSS necesarias
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -50px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50px);
        }
    }

    .skip-curtain:hover {
        transform: scale(1.05);
        border-color: var(--color-accent) !important;
    }

    .skip-curtain i {
        transition: transform 0.3s;
    }

    .skip-curtain:hover i {
        transform: translateX(5px);
    }
`;
document.head.appendChild(style);
