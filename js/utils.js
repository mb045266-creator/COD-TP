/**
 * ملف الدوال المساعدة - utils.js
 * يحتوي على دوال مساعدة عامة للتطبيق
 */

// دالة إظهار التنبيهات
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div>${message}</div>
    `;
    container.appendChild(notification);
    
    // إزالة التنبيه بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// دالة التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// دالة التحقق من قوة كلمة المرور
function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
}

// دالة تنسيق التاريخ
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('ar-DZ', options);
}

// دالة تنسيق الوقت
function formatTime(date) {
    return new Date(date).toLocaleTimeString('ar-DZ');
}

// دالة تنسيق الساعة والدقيقة
function formatDateTime(date) {
    return formatDate(date) + ' ' + formatTime(date);
}

// دالة تنسيق العملة
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-DZ', {
        style: 'currency',
        currency: 'DZD'
    }).format(amount);
}

// دالة توليد معرف فريد
function generateId() {
    return 'ID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// دالة النسخ إلى الحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم النسخ بنجاح', 'success');
    });
}

// دالة تحويل الكائن إلى URL parameters
function objectToParams(obj) {
    return new URLSearchParams(obj).toString();
}

// دالة تحويل URL parameters إلى كائن
function paramsToObject(params) {
    const obj = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

// دالة التحقق من وجود إنترنت
function isOnline() {
    return navigator.onLine;
}

// دالة الانتظار
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة تصفية المصفوفة
function filterArray(array, predicate) {
    return array.filter(predicate);
}

// دالة البحث في المصفوفة
function searchArray(array, query, fields) {
    return array.filter(item => 
        fields.some(field => 
            String(item[field]).toLowerCase().includes(query.toLowerCase())
        )
    );
}

// دالة ترتيب المصفوفة
function sortArray(array, field, ascending = true) {
    return array.sort((a, b) => {
        if (ascending) {
            return a[field] > b[field] ? 1 : -1;
        }
        return a[field] < b[field] ? 1 : -1;
    });
}

// دالة حساب الفرق بين التواريخ بالأيام
function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
}

// دالة التحقق من صلاحية الهاتف
function validatePhone(phone) {
    const re = /^[0-9+\-\s()]+$/;
    return re.test(phone) && phone.length >= 9;
}

// دالة تنسيق رقم الهاتف
function formatPhone(phone) {
    return phone.replace(/^(0|212)(\d{3})(\d{2})(\d{2})(\d{2})$/, '+$1 $2 $3 $4 $5');
}

// دالة حساب النسبة المئوية
function calculatePercentage(part, total) {
    return total === 0 ? 0 : Math.round((part / total) * 100);
}

// دالة تحويل الرقم إلى كلمات
function numberToArabic(num) {
    const ones = ['', 'واحد', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    if (num < 10) return ones[num];
    return num.toString();
}

// دالة عام إرسال طلب HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

// دالة التحقق من صحة النموذج
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// دالة مسح النموذج
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
}

// دالة إظهار/إخفاء عنصر
function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('active');
    }
}

// دالة إظهار عنصر
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

// دالة إخفاء عنصر
function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}
