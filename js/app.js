/**
 * ملف التطبيق الرئيسي - app.js
 * يدير تدفق التطبيق والأحداث الرئيسية
 */

let currentUser = null;
let currentPage = 'login';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    checkUserSession();
});

function initApp() {
    console.log('تهيئة التطبيق...');
    
    // التحقق من الجلسة المحفوظة
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        goToDashboard();
    }
}

function setupEventListeners() {
    // أحداث تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // أحداث التسجيل
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // التبديل بين صفحات التسجيل
    const switchToSignup = document.getElementById('switchToSignup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            goToSignup();
        });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            goToLogin();
        });
    }

    // الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // روابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // التحقق من قوة كلمة المرور
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const strength = getPasswordStrength(e.target.value);
            const strengthBar = document.getElementById('passwordStrength');
            if (strengthBar) {
                strengthBar.className = `password-strength ${strength}`;
            }
        });
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // التحقق من البيانات
    if (!validateEmail(email)) {
        showNotification('البريد الإلكتروني غير صحيح', 'danger');
        return;
    }

    if (password.length < 6) {
        showNotification('كلمة المرور قصيرة جداً', 'danger');
        return;
    }

    // البحث عن المستخدم
    const user = db.getUser(email);
    if (!user) {
        showNotification('المستخدم غير موجود', 'danger');
        return;
    }

    // التحقق من كلمة المرور (في تطبيق حقيقي يجب تشفير كلمات المرور)
    if (user.password !== password) {
        showNotification('كلمة المرور غير صحيحة', 'danger');
        return;
    }

    // تسجيل الدخول
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showNotification('تم تسجيل الدخول بنجاح', 'success');
    goToDashboard();
}

function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // التحقق من البيانات
    if (!name || !email || !phone || !password) {
        showNotification('جميع الحقول مطلوبة', 'danger');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('البريد الإلكتروني غير صحيح', 'danger');
        return;
    }

    if (!validatePhone(phone)) {
        showNotification('رقم الهاتف غير صحيح', 'danger');
        return;
    }

    if (password.length < 6) {
        showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('كلمات المرور غير متطابقة', 'danger');
        return;
    }

    // التحقق من عدم وجود حساب مسبق
    if (db.getUser(email)) {
        showNotification('المستخدم موجود بالفعل', 'danger');
        return;
    }

    // إنشاء المستخدم
    const newUser = db.addUser({
        name,
        email,
        phone,
        password,
        type: 'merchant',
        status: 'active'
    });

    showNotification('تم إنشاء الحساب بنجاح', 'success');
    
    // مسح النموذج
    document.getElementById('signupForm').reset();
    
    // الذهاب لصفحة تسجيل الدخول
    setTimeout(() => goToLogin(), 1000);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('تم تسجيل الخروج', 'info');
    goToLogin();
}

function goToLogin() {
    currentPage = 'login';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('loginPage').classList.add('active');
}

function goToSignup() {
    currentPage = 'signup';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('signupPage').classList.add('active');
}

function goToDashboard() {
    currentPage = 'dashboard';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('dashboardPage').classList.add('active');
    
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.name;
    }
    
    loadDashboard();
}

function navigateTo(page) {
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'agents':
            loadAgents();
            break;
        case 'integrations':
            loadIntegrations();
            break;
        case 'statistics':
            loadStatistics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

function loadDashboard() {
    const container = document.getElementById('dashboardContainer');
    if (!container) return;

    const stats = db.getStatistics();
    const revenue = db.getTotalRevenue();

    container.innerHTML = `
        <h2>لوحة التحكم</h2>
        <div class="grid grid-4">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">إجمالي الطلبات</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.pending}</div>
                <div class="stat-label">قيد الانتظار</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${stats.delivered}</div>
                <div class="stat-label">موصلة</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-value">${stats.cancelled}</div>
                <div class="stat-label">ملغاة</div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>الإيرادات</h3>
            </div>
            <div class="card-body">
                <div class="stat-value" style="font-size: 28px;">${formatCurrency(revenue)}</div>
                <p>من الطلبات المسلمة</p>
            </div>
        </div>
    `;

    // إخفاء المحتويات الأخرى
    document.getElementById('ordersContainer').style.display = 'none';
    document.getElementById('agentsContainer').style.display = 'none';
    document.getElementById('integrationsContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';
    container.style.display = 'block';
}

function loadOrders() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    container.style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('agentsContainer').style.display = 'none';
    document.getElementById('integrationsContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';

    renderOrdersList();
}

function loadAgents() {
    const container = document.getElementById('agentsContainer');
    if (!container) return;

    container.style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('ordersContainer').style.display = 'none';
    document.getElementById('integrationsContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';

    renderAgentsList();
}

function loadIntegrations() {
    const container = document.getElementById('integrationsContainer');
    if (!container) return;

    container.style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('ordersContainer').style.display = 'none';
    document.getElementById('agentsContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';

    renderIntegrationsList();
}

function loadStatistics() {
    const container = document.getElementById('statisticsContainer');
    if (!container) return;

    container.style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('ordersContainer').style.display = 'none';
    document.getElementById('agentsContainer').style.display = 'none';
    document.getElementById('integrationsContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'none';

    renderStatistics();
}

function loadSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;

    container.style.display = 'block';
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('ordersContainer').style.display = 'none';
    document.getElementById('agentsContainer').style.display = 'none';
    document.getElementById('integrationsContainer').style.display = 'none';
    document.getElementById('statisticsContainer').style.display = 'none';

    renderSettings();
}

function checkUserSession() {
    // التحقق من انقضاء الجلسة
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        goToLogin();
    }
}

// دوال العرض (سيتم ملؤها في الملفات الأخرى)
function renderOrdersList() {
    const orders = db.getOrders();
    const container = document.getElementById('ordersContainer');
    
    let html = '<h2>الطلبات</h2><table class="table"><thead><tr>';
    html += '<th>رقم الطلب</th><th>العميل</th><th>الحالة</th><th>المبلغ</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>';
    
    orders.forEach(order => {
        html += `<tr>
            <td>${order.id}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td><span class="badge badge-primary">${order.status}</span></td>
            <td>${formatCurrency(order.amount || 0)}</td>
            <td>${formatDate(order.createdAt)}</td>
            <td><button class="btn btn-sm btn-info">تفاصيل</button></td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderAgentsList() {
    const agents = db.getAgents();
    const container = document.getElementById('agentsContainer');
    
    let html = '<h2>الوكلاء</h2><table class="table"><thead><tr>';
    html += '<th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الحالة</th><th>الطلبات</th><th>الإجراءات</th></tr></thead><tbody>';
    
    agents.forEach(agent => {
        const agentOrders = db.getOrdersByAgent(agent.id).length;
        html += `<tr>
            <td>${agent.name}</td>
            <td>${agent.email}</td>
            <td>${agent.phone}</td>
            <td><span class="badge badge-success">${agent.status}</span></td>
            <td>${agentOrders}</td>
            <td><button class="btn btn-sm btn-info">تفاصيل</button></td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderIntegrationsList() {
    const integrations = db.getIntegrations();
    const container = document.getElementById('integrationsContainer');
    
    let html = '<h2>الربط مع المتاجر</h2><div class="grid grid-2">';
    
    integrations.forEach(integration => {
        html += `<div class="card">
            <div class="card-header">
                <h3>${integration.platform}</h3>
            </div>
            <div class="card-body">
                <p>الحالة: ${integration.status}</p>
                <p>تاريخ الربط: ${formatDate(integration.createdAt)}</p>
            </div>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderStatistics() {
    const stats = db.getStatistics();
    const container = document.getElementById('statisticsContainer');
    
    const deliveryRate = calculatePercentage(stats.delivered, stats.total);
    const cancelRate = calculatePercentage(stats.cancelled, stats.total);
    
    let html = '<h2>الإحصائيات</h2>';
    html += `<div class="grid grid-3">
        <div class="stat-card">
            <div class="stat-label">معدل الإيصال</div>
            <div class="stat-value">${deliveryRate}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">معدل الإلغاء</div>
            <div class="stat-value danger">${cancelRate}%</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">معدل التأكيد</div>
            <div class="stat-value">${calculatePercentage(stats.confirmed + stats.shipped + stats.delivered, stats.total)}%</div>
        </div>
    </div>`;
    
    container.innerHTML = html;
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    const settings = db.getSettings();
    
    let html = '<h2>الإعدادات</h2>';
    html += '<form id="settingsForm" class="card">';
    html += '<div class="form-group">';
    html += '<label>اللغة</label>';
    html += `<select>
        <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
    </select>`;
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary">حفظ</button>';
    html += '</form>';
    
    container.innerHTML = html;
}
