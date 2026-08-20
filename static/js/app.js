/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Core App Logic — Navigation, Auth, Shared Utilities            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const API = '';  // Base URL (same origin)

// ─── Auth State ─────────────────────────────────────────────────
let currentUser = null;

function isLoggedIn() {
    return currentUser !== null;
}

function getUser() {
    const stored = localStorage.getItem('hqm_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
    }
    return null;
}

function setUser(user) {
    currentUser = user;
    localStorage.setItem('hqm_user', JSON.stringify(user));
}

function clearUser() {
    currentUser = null;
    localStorage.removeItem('hqm_user');
}

// ─── Login ──────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        showToast('Please enter username and password.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'Login failed.', 'error');
            return;
        }
        setUser(data.user);
        showApp();
    } catch (err) {
        showToast('Server error. Make sure the Flask server is running.', 'error');
    }
});

function demoLogin(username, password, role) {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = password;
    document.getElementById('login-role').value = role;
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
}

function logout() {
    clearUser();
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('login-page').style.display = '';
    // Reset form
    document.getElementById('login-form').reset();
}

// ─── Show App ───────────────────────────────────────────────────
function showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-shell').style.display = 'flex';

    // Update user display
    if (currentUser) {
        document.getElementById('sidebar-user').textContent = `${currentUser.username} (${currentUser.role})`;
        document.getElementById('user-role-badge').textContent = currentUser.role;
    }

    navigateTo('dashboard');
}

// ─── Navigation ─────────────────────────────────────────────────
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('mobile-open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('visible');
    });
});

function navigateTo(page) {
    // Update nav
    navItems.forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) targetPage.classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        register: 'Register Patient',
        queue: 'Patient Queue',
        doctor: 'Doctor Dashboard',
        statistics: 'Statistics',
        visualizer: 'Algorithm Visualizer',
        details: 'Patient Details',
        about: 'About Project'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

    // Load page data
    if (page === 'dashboard') loadDashboard();
    if (page === 'queue') loadQueue();
    if (page === 'doctor') loadDoctorDashboard();
    if (page === 'statistics') loadStatistics();
    if (page === 'visualizer') loadVisualizerHeap();
    if (page === 'details') loadAllPatientsList();
}

// ─── Sidebar Toggle ─────────────────────────────────────────────
document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Mobile menu
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('mobile-open');

    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('visible');
        });
    }
    overlay.classList.toggle('visible');
});

// ─── Toast Notifications ────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = document.getElementById('toast-message');

    msg.textContent = message;
    toast.classList.remove('toast-error');

    if (type === 'error') {
        toast.classList.add('toast-error');
        icon.className = 'toast-icon fas fa-exclamation-circle';
    } else {
        icon.className = 'toast-icon fas fa-check-circle';
    }

    toast.style.display = 'flex';
    // Auto-hide after 4 seconds
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(hideToast, 4000);
}

function hideToast() {
    document.getElementById('toast').style.display = 'none';
}

// ─── Load Demo Data ─────────────────────────────────────────────
async function loadDemoData() {
    try {
        const res = await fetch(`${API}/api/queue/load-demo`, { method: 'POST' });
        const data = await res.json();
        showToast(data.message);
        // Refresh current page
        const activePage = document.querySelector('.nav-item.active');
        if (activePage) navigateTo(activePage.dataset.page);
    } catch (err) {
        showToast('Failed to load demo data.', 'error');
    }
}

// ─── Utility Functions ──────────────────────────────────────────
function getPriorityClass(priority) {
    if (priority >= 9) return 'critical';
    if (priority >= 5) return 'serious';
    if (priority >= 3) return 'moderate';
    return 'routine';
}

function getPriorityBadge(priority) {
    const cls = getPriorityClass(priority);
    const labels = { critical: '🔴 Critical', serious: '🟠 Serious', moderate: '🟡 Moderate', routine: '🟢 Routine' };
    const badgeClass = { critical: 'badge-danger', serious: 'badge-warning', moderate: 'badge-yellow', routine: 'badge-success' };
    return `<span class="badge ${badgeClass[cls]}">${labels[cls]}</span>`;
}

function getStatusBadge(status) {
    const cls = { 'Waiting': 'badge-warning', 'In Treatment': 'badge-info', 'Completed': 'badge-success' };
    return `<span class="badge ${cls[status] || 'badge-outline'}">${status}</span>`;
}

function getPriorityColor(priority) {
    if (priority >= 9) return '#ef4444';
    if (priority >= 7) return '#f97316';
    if (priority >= 5) return '#eab308';
    if (priority >= 3) return '#3b82f6';
    return '#10b981';
}

function formatTime(timeStr) {
    if (!timeStr) return '—';
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Call Next Patient (global) ─────────────────────────────────
async function callNextPatient() {
    try {
        const res = await fetch(`${API}/api/queue/call-next`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'No patients waiting.', 'error');
            return;
        }
        showToast(data.message);
        // Refresh
        const activePage = document.querySelector('.nav-item.active');
        if (activePage) navigateTo(activePage.dataset.page);
    } catch (err) {
        showToast('Error calling next patient.', 'error');
    }
}

// ─── View Patient Details ───────────────────────────────────────
function viewPatient(patientId) {
    navigateTo('details');
    setTimeout(() => {
        document.getElementById('details-search').value = patientId;
        searchPatientDetails();
    }, 100);
}

// ─── Theme Management (Dark / Light Mode) ──────────────────────
function initTheme() {
    const savedTheme = localStorage.getItem('hqm_theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
        localStorage.setItem('hqm_theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.body.classList.remove('dark-theme');
        localStorage.setItem('hqm_theme', 'light');
    }
    updateThemeUI(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // If on statistics page, refresh charts
    const activePage = document.querySelector('.nav-item.active');
    if (activePage && activePage.dataset.page === 'statistics') {
        loadStatistics();
    }
}

function updateThemeUI(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    const texts = document.querySelectorAll('.theme-text');
    
    icons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun theme-icon';
            icon.style.color = '#f59e0b';
        } else {
            icon.className = 'fas fa-moon theme-icon';
            icon.style.color = '';
        }
    });
    
    texts.forEach(txt => {
        txt.textContent = theme === 'dark' ? 'Light' : 'Dark';
    });
}

// ─── Init ───────────────────────────────────────────────────────
(function init() {
    initTheme();
    const user = getUser();
    if (user) {
        currentUser = user;
        showApp();
    }
})();
