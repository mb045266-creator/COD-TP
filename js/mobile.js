/**
 * تطبيق الهاتف المحمول - mobile.js
 * يدير واجهة الهاتف والعمليات على تطبيق الوكلاء
 */

let mobileCurrentUser = null;
let mobileCurrentPage = 'mobileLogin';

// تهيئة التطبيق المحمول
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mobileApp')) {
        initMobileApp();
        setupMobileEventListeners();
    }
});

function initMobileApp() {
    console.log('تهيئة تطبيق الهاتف...');
    
    // التحقق من الجلسة المحفوظة
    const savedUser = localStorage.getItem('mobileAgent');
    if (savedUser) {
        mobileCurrentUser = JSON.parse(savedUser);
        goToMobileOrders();
    }
}

function setupMobileEventListeners() {
    // حدث تسجيل الدخول
    const loginForm = document.getElementById('mobileLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleMobileLogin);
    }

    // أزرار التنقل السفلية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            navigateMobilePage(page);
        });
    });

    // زر الرجوع
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            goToMobileOrders();
        });
    });
}

function handleMobileLogin(e) {
    e.preventDefault();

    const email = document.getElementById('mobileEmail').value;
    const password = document.getElementById('mobilePassword').value;

    if (!validateEmail(email)) {
        showMobileNotification('البريد الإلكتروني غير صحيح', 'danger');
        return;
    }

    // البحث عن الوكيل
    const agents = db.getAgents();
    const agent = agents.find(a => a.email === email && a.password === password);

    if (!agent) {
        showMobileNotification('بيانات الدخول غير صحيحة', 'danger');
        return;
    }

    if (agent.status !== 'active') {
        showMobileNotification('حسابك معطل أو غير مفعل', 'danger');
        return;
    }

    // تسجيل الدخول
    mobileCurrentUser = agent;
    localStorage.setItem('mobileAgent', JSON.stringify(agent));
    showMobileNotification('تم تسجيل الدخول بنجاح', 'success');
    goToMobileOrders();
}

function showMobileNotification(message, type = 'info') {
    const container = document.getElementById('mobileNotifications');
    const notification = document.createElement('div');
    notification.className = `mobile-notification ${type}`;
    notification.innerHTML = `<div>${message}</div>`;
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function goToMobileOrders() {
    navigateMobilePage('mobileOrders');
    renderMobileOrdersList();
}

function renderMobileOrdersList() {
    if (!mobileCurrentUser) return;

    const allOrders = db.getOrders();
    const myOrders = allOrders.filter(o => o.assignedAgent === mobileCurrentUser.id);
    const container = document.getElementById('mobileOrdersList');

    if (!container) return;

    if (myOrders.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">لا توجد طلبات مسندة إليك</div>';
        return;
    }

    let html = '';
    myOrders.forEach(order => {
        const statusColors = {
            'pending': '#3498db',
            'confirmed': '#16a085',
            'shipped': '#f39c12',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };

        html += `
            <div class="mobile-list-item" onclick="viewMobileOrderDetails('${order.id}')">
                <div class="order-item-header">
                    <div class="order-item-id">${order.id}</div>
                    <div class="order-item-status" style="background-color: ${statusColors[order.status]}; color: white;">
                        ${order.status}
                    </div>
                </div>
                <div class="order-item-customer">${order.customerName}</div>
                <div class="order-item-details">
                    📱 ${order.customerPhone}
                </div>
                <div class="order-item-details">
                    📍 ${order.address.substring(0, 40)}...
                </div>
                <div class="order-item-amount">${formatCurrency(order.amount)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function viewMobileOrderDetails(orderId) {
    const order = db.getOrder(orderId);
    if (!order) return;

    const container = document.getElementById('mobileOrderDetails');
    document.getElementById('orderIdDisplay').textContent = order.id;

    let detailsHTML = `
        <div class="detail-row">
            <span class="detail-label">اسم العميل</span>
            <span class="detail-value">${order.customerName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">الهاتف</span>
            <span class="detail-value" onclick="copyToClipboard('${order.customerPhone}')" style="cursor: pointer; color: #3498db;">
                ${order.customerPhone}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">العنوان</span>
            <span class="detail-value">${order.address}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">الوصف</span>
            <span class="detail-value">${order.description || 'بدون وصف'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">المبلغ</span>
            <span class="detail-value" style="color: #27ae60; font-size: 18px;">${formatCurrency(order.amount)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">الحالة الحالية</span>
            <span class="detail-value" style="color: #f39c12;">${order.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">تاريخ الإنشاء</span>
            <span class="detail-value">${formatDateTime(order.createdAt)}</span>
        </div>
    `;

    if (container) {
        container.innerHTML = detailsHTML;
    }

    // تعديل الأزرار حسب الحالة
    const confirmBtn = document.getElementById('confirmOrderBtn');
    const shipBtn = document.getElementById('shipOrderBtn');
    const cancelBtn = document.getElementById('cancelOrderBtn');

    if (confirmBtn) {
        if (order.status === 'pending') {
            confirmBtn.style.display = 'block';
            confirmBtn.onclick = () => updateMobileOrderStatus(orderId, 'confirmed');
        } else {
            confirmBtn.style.display = 'none';
        }
    }

    if (shipBtn) {
        if (order.status === 'confirmed') {
            shipBtn.style.display = 'block';
            shipBtn.onclick = () => updateMobileOrderStatus(orderId, 'shipped');
        } else {
            shipBtn.style.display = 'none';
        }
    }

    if (cancelBtn) {
        if (['pending', 'confirmed'].includes(order.status)) {
            cancelBtn.style.display = 'block';
            cancelBtn.onclick = () => updateMobileOrderStatus(orderId, 'cancelled');
        } else {
            cancelBtn.style.display = 'none';
        }
    }

    navigateMobilePage('mobileOrderDetails');
}

function updateMobileOrderStatus(orderId, newStatus) {
    if (confirm('هل تريد تأكيد هذا التغيير؟')) {
        db.updateOrder(orderId, { status: newStatus });
        showMobileNotification('تم تحديث حالة الطلب بنجاح', 'success');
        setTimeout(() => {
            goToMobileOrders();
        }, 1000);
    }
}

function navigateMobilePage(page) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.mobile-page').forEach(p => p.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        mobileCurrentPage = page;

        // تحديث أزرار التنقل
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // تحميل المحتوى المناسب
        if (page === 'mobileOrders') {
            renderMobileOrdersList();
        } else if (page === 'mobileStats') {
            renderMobileStatistics();
        } else if (page === 'mobileProfile') {
            renderMobileProfile();
        }
    }
}

function renderMobileStatistics() {
    if (!mobileCurrentUser) return;

    const allOrders = db.getOrders();
    const myOrders = allOrders.filter(o => o.assignedAgent === mobileCurrentUser.id);
    
    const delivered = myOrders.filter(o => o.status === 'delivered').length;
    const cancelled = myOrders.filter(o => o.status === 'cancelled').length;
    const pending = myOrders.filter(o => o.status === 'pending').length;
    const confirmed = myOrders.filter(o => o.status === 'confirmed').length;
    const shipped = myOrders.filter(o => o.status === 'shipped').length;

    const successRate = myOrders.length > 0 ? calculatePercentage(delivered, myOrders.length) : 0;
    const revenue = myOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.amount || 0), 0);

    let html = `
        <div style="padding: 15px;">
            <h2>إحصائياتي</h2>
            <div class="grid grid-2" style="gap: 10px; margin-top: 15px;">
                <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${myOrders.length}</div>
                    <div style="color: #7f8c8d; margin-top: 5px; font-size: 12px;">إجمالي الطلبات</div>
                </div>
                <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${delivered}</div>
                    <div style="color: #7f8c8d; margin-top: 5px; font-size: 12px;">الموصلة</div>
                </div>
                <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cancelled}</div>
                    <div style="color: #7f8c8d; margin-top: 5px; font-size: 12px;">الملغاة</div>
                </div>
                <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${successRate}%</div>
                    <div style="color: #7f8c8d; margin-top: 5px; font-size: 12px;">معدل النجاح</div>
                </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
                <div style="color: #7f8c8d;">الإيرادات</div>
                <div style="font-size: 24px; font-weight: bold; color: #27ae60; margin-top: 10px;">${formatCurrency(revenue)}</div>
            </div>
        </div>
    `;

    const container = document.getElementById('mobileOrdersList');
    if (container) {
        container.innerHTML = html;
    }
}

function renderMobileProfile() {
    if (!mobileCurrentUser) return;

    let html = `
        <div style="padding: 15px;">
            <h2>ملفي الشخصي</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 12px;">الاسم</div>
                    <div style="font-weight: bold; margin-top: 5px;">${mobileCurrentUser.name}</div>
                </div>
                <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 12px;">البريد الإلكتروني</div>
                    <div style="font-weight: bold; margin-top: 5px;">${mobileCurrentUser.email}</div>
                </div>
                <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 12px;">الهاتف</div>
                    <div style="font-weight: bold; margin-top: 5px;">${mobileCurrentUser.phone}</div>
                </div>
                <div style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 12px;">المنطقة</div>
                    <div style="font-weight: bold; margin-top: 5px;">${mobileCurrentUser.region || 'غير محدد'}</div>
                </div>
                <div style="padding-bottom: 15px; margin-bottom: 15px;">
                    <div style="color: #7f8c8d; font-size: 12px;">الحد الأقصى للطلبات اليومية</div>
                    <div style="font-weight: bold; margin-top: 5px;">${mobileCurrentUser.maxOrders} طلب</div>
                </div>
                <button class="btn btn-danger btn-block" onclick="handleMobileLogout()">تسجيل الخروج</button>
            </div>
        </div>
    `;

    const container = document.getElementById('mobileOrdersList');
    if (container) {
        container.innerHTML = html;
    }
}

function handleMobileLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        mobileCurrentUser = null;
        localStorage.removeItem('mobileAgent');
        document.querySelectorAll('.mobile-page').forEach(p => p.classList.remove('active'));
        document.getElementById('mobileLoginPage').classList.add('active');
        document.getElementById('mobileLoginForm').reset();
    }
}
