// ===========================================
// MAIN.JS - BARA & CO
// Inicialización global y utilidades
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    inicializarHeader();
    inicializarCursor();
    inicializarAnimaciones();
    inicializarMenuMobile();
    inicializarClasesBody();
});

// Header con cambio al hacer scroll
function inicializarHeader() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Trigger inicial
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    }
}

// Detectar página para estilos específicos
function inicializarClasesBody() {
    const body = document.body;
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/' || path === '') {
        body.classList.add('inicio');
        body.classList.remove('interior');
    } else {
        body.classList.add('interior');
        body.classList.remove('inicio');
    }
}

// Cursor personalizado (solo desktop)
function inicializarCursor() {
    if (window.innerWidth <= 768) return;
    
    // Crear elementos si no existen
    if (!document.querySelector('.custom-cursor')) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        document.body.appendChild(cursorDot);
    }
    
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    
    if (!cursor || !cursorDot) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
    });
    
    // Efecto hover en elementos clickeables
    const clickables = document.querySelectorAll('a, button, .cart-icon, .cart-icon-wrap, .nav-link, .btn');
    
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorDot.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorDot.classList.remove('active');
        });
    });
}

// Animaciones al hacer scroll
function inicializarAnimaciones() {
    const elementos = document.querySelectorAll('.fade-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    
    elementos.forEach(el => observer.observe(el));
}

// Menú mobile
function inicializarMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

// Smooth scroll para anclas
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Prevenir comportamiento por defecto en botones vacíos
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        e.preventDefault();
    }
});
