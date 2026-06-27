/**
 * ملف إدارة قاعدة البيانات - database.js
 * يتعامل مع LocalStorage و IndexedDB
 */

class Database {
    constructor() {
        this.storeName = 'COD_TP';
        this.version = 1;
        this.db = null;
        this.init();
    }

    // تهيئة قاعدة البيانات
    async init() {
        // استخدام LocalStorage أولاً
        this.loadFromLocalStorage();
    }

    // حفظ البيانات في LocalStorage
    save(key, data) {
        try {
            const store = JSON.parse(localStorage.getItem(this.storeName) || '{}');
            store[key] = data;
            localStorage.setItem(this.storeName, JSON.stringify(store));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    // استرجاع البيانات من LocalStorage
    get(key) {
        try {
            const store = JSON.parse(localStorage.getItem(this.storeName) || '{}');
            return store[key] || null;
        } catch (error) {
            console.error('Get error:', error);
            return null;
        }
    }

    // حذف البيانات
    delete(key) {
        try {
            const store = JSON.parse(localStorage.getItem(this.storeName) || '{}');
            delete store[key];
            localStorage.setItem(this.storeName, JSON.stringify(store));
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            return false;
        }
    }

    // مسح جميع البيانات
    clear() {
        try {
            localStorage.removeItem(this.storeName);
            return true;
        } catch (error) {
            console.error('Clear error:', error);
            return false;
        }
    }

    // تحميل البيانات الأولية
    loadFromLocalStorage() {
        const store = localStorage.getItem(this.storeName);
        if (!store) {
            this.initializeDefaultData();
        }
    }

    // تهيئة البيانات الافتراضية
    initializeDefaultData() {
        const defaultData = {
            users: [],
            agents: [],
            orders: [],
            integrations: [],
            settings: {
                language: 'ar',
                theme: 'light',
                currency: 'DZD'
            }
        };
        localStorage.setItem(this.storeName, JSON.stringify(defaultData));
    }

    // إضافة مستخدم جديد
    addUser(user) {
        const users = this.get('users') || [];
        user.id = generateId();
        user.createdAt = new Date().toISOString();
        users.push(user);
        this.save('users', users);
        return user;
    }

    // الحصول على مستخدم
    getUser(email) {
        const users = this.get('users') || [];
        return users.find(u => u.email === email);
    }

    // تحديث مستخدم
    updateUser(id, userData) {
        const users = this.get('users') || [];
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            this.save('users', users);
            return users[index];
        }
        return null;
    }

    // إضافة وكيل جديد
    addAgent(agent) {
        const agents = this.get('agents') || [];
        agent.id = generateId();
        agent.createdAt = new Date().toISOString();
        agents.push(agent);
        this.save('agents', agents);
        return agent;
    }

    // الحصول على جميع الوكلاء
    getAgents() {
        return this.get('agents') || [];
    }

    // الحصول على وكيل
    getAgent(id) {
        const agents = this.get('agents') || [];
        return agents.find(a => a.id === id);
    }

    // تحديث وكيل
    updateAgent(id, agentData) {
        const agents = this.get('agents') || [];
        const index = agents.findIndex(a => a.id === id);
        if (index !== -1) {
            agents[index] = { ...agents[index], ...agentData };
            this.save('agents', agents);
            return agents[index];
        }
        return null;
    }

    // حذف وكيل
    deleteAgent(id) {
        const agents = this.get('agents') || [];
        const index = agents.findIndex(a => a.id === id);
        if (index !== -1) {
            agents.splice(index, 1);
            this.save('agents', agents);
            return true;
        }
        return false;
    }

    // إضافة طلب جديد
    addOrder(order) {
        const orders = this.get('orders') || [];
        order.id = generateId();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.push(order);
        this.save('orders', orders);
        return order;
    }

    // الحصول على جميع الطلبات
    getOrders() {
        return this.get('orders') || [];
    }

    // الحصول على طلب
    getOrder(id) {
        const orders = this.get('orders') || [];
        return orders.find(o => o.id === id);
    }

    // تحديث طلب
    updateOrder(id, orderData) {
        const orders = this.get('orders') || [];
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...orderData };
            this.save('orders', orders);
            return orders[index];
        }
        return null;
    }

    // الحصول على الطلبات حسب الحالة
    getOrdersByStatus(status) {
        const orders = this.get('orders') || [];
        return orders.filter(o => o.status === status);
    }

    // الحصول على الطلبات حسب الوكيل
    getOrdersByAgent(agentId) {
        const orders = this.get('orders') || [];
        return orders.filter(o => o.assignedAgent === agentId);
    }

    // إضافة عملية ربط
    addIntegration(integration) {
        const integrations = this.get('integrations') || [];
        integration.id = generateId();
        integration.createdAt = new Date().toISOString();
        integrations.push(integration);
        this.save('integrations', integrations);
        return integration;
    }

    // الحصول على جميع التكاملات
    getIntegrations() {
        return this.get('integrations') || [];
    }

    // حذف تكامل
    deleteIntegration(id) {
        const integrations = this.get('integrations') || [];
        const index = integrations.findIndex(i => i.id === id);
        if (index !== -1) {
            integrations.splice(index, 1);
            this.save('integrations', integrations);
            return true;
        }
        return false;
    }

    // حساب الإحصائيات
    getStatistics() {
        const orders = this.get('orders') || [];
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };
    }

    // حساب الإيرادات
    getTotalRevenue() {
        const orders = this.get('orders') || [];
        return orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (o.amount || 0), 0);
    }

    // الحصول على الإعدادات
    getSettings() {
        return this.get('settings') || {};
    }

    // تحديث الإعدادات
    updateSettings(settings) {
        const currentSettings = this.getSettings();
        this.save('settings', { ...currentSettings, ...settings });
    }
}

// إنشاء instance من قاعدة البيانات
const db = new Database();
