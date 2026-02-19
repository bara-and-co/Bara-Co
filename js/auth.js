// SISTEMA DE AUTENTICACIÓN
class Auth {
    constructor() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || this.usuariosIniciales();
        this.usuarioActual = JSON.parse(sessionStorage.getItem('usuarioActual'));
        this.init();
    }
    
    usuariosIniciales() {
        return [
            {
                id: '1',
                nombre: 'Admin',
                email: 'admin@bara.co',
                password: this.hashPassword('admin123'),
                rol: 'admin',
                fechaRegistro: '2026-01-01'
            }
        ];
    }
    
    hashPassword(password) {
        // SIMPLE - NO USAR EN PRODUCCIÓN REAL
        // En un proyecto real usar bcrypt o similar en backend
        return btoa(password); // Solo para demo
    }
    
    init() {
        // Verificar si hay usuario logueado
        this.actualizarUI();
        
        // Proteger rutas admin
        if (window.location.pathname.includes('admin') && !this.esAdmin()) {
            window.location.href = 'login.html?redirect=admin';
        }
    }
    
    async login(email, password) {
        const hashedPassword = this.hashPassword(password);
        const usuario = this.usuarios.find(u => u.email === email && u.password === hashedPassword);
        
        if (usuario) {
            const { password, ...usuarioSinPassword } = usuario;
            this.usuarioActual = usuarioSinPassword;
            sessionStorage.setItem('usuarioActual', JSON.stringify(usuarioSinPassword));
            this.actualizarUI();
            
            // Disparar evento de login
            window.dispatchEvent(new CustomEvent('auth:login', { detail: usuarioSinPassword }));
            
            return { success: true, usuario: usuarioSinPassword };
        }
        
        return { success: false, error: 'Email o contraseña incorrectos' };
    }
    
    logout() {
        this.usuarioActual = null;
        sessionStorage.removeItem('usuarioActual');
        this.actualizarUI();
        
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        if (window.location.pathname.includes('admin')) {
            window.location.href = 'index.html';
        }
    }
    
    registrar(datos) {
        // Verificar si el email ya existe
        if (this.usuarios.find(u => u.email === datos.email)) {
            return { success: false, error: 'El email ya está registrado' };
        }
        
        const nuevoUsuario = {
            id: Date.now().toString(),
            nombre: datos.nombre,
            email: datos.email,
            password: this.hashPassword(datos.password),
            rol: 'cliente',
            fechaRegistro: new Date().toISOString()
        };
        
        this.usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
        
        return { success: true, usuario: nuevoUsuario };
    }
    
    esAdmin() {
        return this.usuarioActual?.rol === 'admin';
    }
    
    estaLogueado() {
        return !!this.usuarioActual;
    }
    
    actualizarUI() {
        // Actualizar elementos en la UI según estado de login
        const userIcon = document.querySelector('.header-icons .fa-user');
        if (userIcon) {
            if (this.estaLogueado()) {
                userIcon.classList.remove('fa-user');
                userIcon.classList.add('fa-user-check');
                userIcon.style.color = 'var(--color-accent)';
                
                // Tooltip con nombre
                userIcon.parentElement.title = `Hola, ${this.usuarioActual.nombre}`;
            } else {
                userIcon.classList.remove('fa-user-check');
                userIcon.classList.add('fa-user');
                userIcon.style.color = '';
                userIcon.parentElement.title = 'Iniciar sesión';
            }
        }
        
        // Mostrar/ocultar elementos de admin
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = this.esAdmin() ? 'block' : 'none';
        });
    }
    
    // Recuperar contraseña (simulado)
    recuperarPassword(email) {
        const usuario = this.usuarios.find(u => u.email === email);
        if (usuario) {
            // En producción, enviar email
            alert(`Se ha enviado un email de recuperación a ${email}`);
            return true;
        }
        alert('Email no encontrado');
        return false;
    }
}

// Inicializar auth global
const auth = new Auth();

// Funciones globales para login/registro
function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = auth.login(email, password);
    
    if (result.success) {
        // Redirigir según el rol
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || (result.usuario.rol === 'admin' ? 'admin.html' : 'mi-cuenta.html');
        window.location.href = redirect;
    } else {
        alert(result.error);
    }
}

function register(event) {
    event.preventDefault();
    const nombre = document.getElementById('registerNombre').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    const result = auth.registrar({ nombre, email, password });
    
    if (result.success) {
        alert('Registro exitoso. Ya puedes iniciar sesión.');
        window.location.href = 'login.html';
    } else {
        alert(result.error);
    }
}

function logout() {
    auth.logout();
}

// Página de login
function renderLoginPage() {
    const container = document.getElementById('authContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h2>Iniciar Sesión</h2>
                <form onsubmit="login(event)">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn">Ingresar</button>
                </form>
                <p class="auth-links">
                    <a href="#" onclick="showRegister()">Crear cuenta</a> | 
                    <a href="#" onclick="showRecover()">Olvidé mi contraseña</a>
                </p>
            </div>
        </div>
    `;
}

function showRegister() {
    const container = document.getElementById('authContainer');
    container.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h2>Registrarse</h2>
                <form onsubmit="register(event)">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" id="registerNombre" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="registerPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Confirmar Contraseña</label>
                        <input type="password" id="registerConfirmPassword" required>
                    </div>
                    <button type="submit" class="btn">Registrarse</button>
                </form>
                <p class="auth-links">
                    <a href="#" onclick="renderLoginPage()">Ya tengo cuenta</a>
                </p>
            </div>
        </div>
    `;
}

function showRecover() {
    const email = prompt('Ingresá tu email para recuperar la contraseña:');
    if (email) {
        auth.recuperarPassword(email);
    }
}

// Estilos para autenticación (agregar a global.css)
const authStyles = `
    .auth-container {
        min-height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        margin-top: 80px;
    }
    
    .auth-card {
        background: white;
        padding: 3rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
    }
    
    .auth-card h2 {
        font-family: var(--font-serif);
        margin-bottom: 2rem;
        text-align: center;
    }
    
    .auth-card .form-group {
        margin-bottom: 1.5rem;
    }
    
    .auth-card label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    
    .auth-card input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--color-border);
        font-family: var(--font-sans);
    }
    
    .auth-card .btn {
        width: 100%;
        margin-top: 1rem;
    }
    
    .auth-links {
        margin-top: 1.5rem;
        text-align: center;
        color: var(--color-text-secondary);
    }
    
    .auth-links a {
        color: var(--color-accent);
        cursor: pointer;
    }
`;

// Agregar estilos si no existen
if (!document.getElementById('authStyles')) {
    const style = document.createElement('style');
    style.id = 'authStyles';
    style.textContent = authStyles;
    document.head.appendChild(style);
}
