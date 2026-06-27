/**
 * ملف ربط المتاجر - integrations.js
 * يدير ربط مع Shopify, YuKan وغيرها
 */

function renderIntegrationsList() {
    const integrations = db.getIntegrations();
    const container = document.getElementById('integrationsContainer');
    
    if (!container) return;

    let html = `
        <div class="card">
            <div class="card-header">
                <h2>ربط مع المتاجر الإلكترونية</h2>
                <button class="btn btn-primary" onclick="openAddIntegrationModal()">+ ربط جديد</button>
            </div>
            <div class="card-body">
                <div class="grid grid-2">
    `;

    // منصات متاحة للربط
    const platforms = [
        { id: 'shopify', name: 'Shopify', icon: '🛍️', color: '#96bf48' },
        { id: 'yukan', name: 'YuKan', icon: '📦', color: '#FF6B6B' },
        { id: 'woocommerce', name: 'WooCommerce', icon: '🏪', color: '#96588a' },
        { id: 'prestashop', name: 'PrestaShop', icon: '💼', color: '#DF0067' }
    ];

    platforms.forEach(platform => {
        const integration = integrations.find(i => i.platform === platform.name);
        const isConnected = integration && integration.status === 'connected';

        html += `
            <div style="border: 2px solid ${isConnected ? '#27ae60' : '#ddd'}; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${platform.icon}</div>
                <h3 style="margin: 10px 0;">${platform.name}</h3>
                <p style="color: #7f8c8d; margin-bottom: 15px;">
                    ${isConnected ? '✓ متصل' : 'غير متصل'}
                </p>
                ${isConnected ? `
                    <button class="btn btn-sm btn-danger" onclick="disconnectIntegration('${integration.id}')">قطع الاتصال</button>
                ` : `
                    <button class="btn btn-sm btn-primary" onclick="connectPlatform('${platform.id}')">ربط</button>
                `}
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>المتاجر المرتبطة</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>المتجر</th>
                            <th>المنصة</th>
                            <th>الحالة</th>
                            <th>تاريخ الربط</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (integrations.length === 0) {
        html += '<tr><td colspan="5" style="text-align: center; color: #999;">لم تقم بربط أي متجر حتى الآن</td></tr>';
    } else {
        integrations.forEach(integration => {
            html += `
                <tr>
                    <td><strong>${integration.storeName}</strong></td>
                    <td>${integration.platform}</td>
                    <td><span class="badge badge-${integration.status === 'connected' ? 'success' : 'danger'}">${integration.status}</span></td>
                    <td>${formatDate(integration.createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editIntegration('${integration.id}')">تفاصيل</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteIntegration('${integration.id}')">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function connectPlatform(platformId) {
    const platformNames = {
        'shopify': 'Shopify',
        'yukan': 'YuKan',
        'woocommerce': 'WooCommerce',
        'prestashop': 'PrestaShop'
    };

    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = `ربط ${platformNames[platformId]}`;
    
    let formHTML = `
        <form id="connectPlatformForm" class="form-group">
            <div class="form-group">
                <label>اسم المتجر *</label>
                <input type="text" id="storeName" placeholder="اسم متجرك" required>
            </div>
    `;

    // نماذج مختلفة حسب المنصة
    if (platformId === 'shopify') {
        formHTML += `
            <div class="form-group">
                <label>اسم المتجر Shopify *</label>
                <input type="text" id="shopifyStore" placeholder="example.myshopify.com" required>
            </div>
            <div class="form-group">
                <label>API Key *</label>
                <input type="password" id="shopifyKey" placeholder="مفتاح API" required>
            </div>
            <div class="form-group">
                <label>API Password *</label>
                <input type="password" id="shopifyPassword" placeholder="كلمة مرور API" required>
            </div>
        `;
    } else if (platformId === 'yukan') {
        formHTML += `
            <div class="form-group">
                <label>معرف المتجر *</label>
                <input type="text" id="yukanStoreId" placeholder="معرف المتجر" required>
            </div>
            <div class="form-group">
                <label>مفتاح الوصول *</label>
                <input type="password" id="yukanKey" placeholder="مفتاح الوصول" required>
            </div>
        `;
    } else {
        formHTML += `
            <div class="form-group">
                <label>رابط المتجر *</label>
                <input type="url" id="platformUrl" placeholder="https://example.com" required>
            </div>
            <div class="form-group">
                <label>مفتاح الوصول *</label>
                <input type="password" id="platformKey" placeholder="مفتاح الوصول" required>
            </div>
        `;
    }

    formHTML += `</form>`;
    document.getElementById('modalBody').innerHTML = formHTML;

    document.getElementById('modalConfirm').onclick = () => {
        const storeName = document.getElementById('storeName').value;
        
        if (!storeName) {
            showNotification('يجب إدخال اسم المتجر', 'danger');
            return;
        }

        // حفظ البيانات
        const integration = db.addIntegration({
            storeName: storeName,
            platform: platformNames[platformId],
            platformId: platformId,
            status: 'connected',
            credentials: {
                // في تطبيق حقيقي، يجب تشفير هذه البيانات
                key: document.getElementById(platformId + 'Key')?.value || document.getElementById('platformKey')?.value || ''
            }
        });

        showNotification(`تم ربط متجرك مع ${platformNames[platformId]} بنجاح`, 'success');
        modal.classList.remove('active');
        renderIntegrationsList();
    };

    modal.classList.add('active');
}

function editIntegration(integrationId) {
    const integration = db.get('integrations').find(i => i.id === integrationId);
    if (!integration) return;

    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = `تعديل: ${integration.storeName}`;
    document.getElementById('modalBody').innerHTML = `
        <form id="editIntegrationForm" class="form-group">
            <div class="form-group">
                <label>اسم المتجر</label>
                <input type="text" id="editStoreName" value="${integration.storeName}" required>
            </div>
            <div class="form-group">
                <label>المنصة</label>
                <input type="text" value="${integration.platform}" disabled>
            </div>
            <div class="form-group">
                <label>الحالة</label>
                <select id="editIntegrationStatus">
                    <option value="connected" ${integration.status === 'connected' ? 'selected' : ''}>متصل</option>
                    <option value="disconnected" ${integration.status === 'disconnected' ? 'selected' : ''}>غير متصل</option>
                </select>
            </div>
        </form>
    `;

    document.getElementById('modalConfirm').onclick = () => {
        const integrations = db.get('integrations') || [];
        const index = integrations.findIndex(i => i.id === integrationId);
        if (index !== -1) {
            integrations[index].storeName = document.getElementById('editStoreName').value;
            integrations[index].status = document.getElementById('editIntegrationStatus').value;
            db.save('integrations', integrations);
            showNotification('تم تحديث البيانات بنجاح', 'success');
            modal.classList.remove('active');
            renderIntegrationsList();
        }
    };

    modal.classList.add('active');
}

function disconnectIntegration(integrationId) {
    if (confirm('هل أنت متأكد من قطع الاتصال؟')) {
        const integrations = db.get('integrations') || [];
        const index = integrations.findIndex(i => i.id === integrationId);
        if (index !== -1) {
            integrations[index].status = 'disconnected';
            db.save('integrations', integrations);
            showNotification('تم قطع الاتصال', 'info');
            renderIntegrationsList();
        }
    }
}

function deleteIntegration(integrationId) {
    if (confirm('هل أنت متأكد من حذف هذا الربط؟')) {
        if (db.deleteIntegration(integrationId)) {
            showNotification('تم حذف الربط بنجاح', 'success');
            renderIntegrationsList();
        }
    }
}

function openAddIntegrationModal() {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'ربط متجر جديد';
    document.getElementById('modalBody').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <button class="btn btn-block" onclick="connectPlatform('shopify')" style="padding: 15px;">
                🛍️ Shopify
            </button>
            <button class="btn btn-block" onclick="connectPlatform('yukan')" style="padding: 15px;">
                📦 YuKan
            </button>
            <button class="btn btn-block" onclick="connectPlatform('woocommerce')" style="padding: 15px;">
                🏪 WooCommerce
            </button>
            <button class="btn btn-block" onclick="connectPlatform('prestashop')" style="padding: 15px;">
                💼 PrestaShop
            </button>
        </div>
    `;
    document.getElementById('modalConfirm').style.display = 'none';
    modal.classList.add('active');
}

function renderSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;

    const settings = db.getSettings();

    let html = `
        <div class="card">
            <div class="card-header">
                <h2>الإعدادات</h2>
            </div>
            <div class="card-body">
                <form id="settingsForm">
                    <div class="form-group">
                        <label>اللغة</label>
                        <select id="settingLanguage">
                            <option value="ar" ${settings.language === 'ar' ? 'selected' : ''}>العربية</option>
                            <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>العملة</label>
                        <select id="settingCurrency">
                            <option value="DZD" ${settings.currency === 'DZD' ? 'selected' : ''}>الدينار الجزائري (DZD)</option>
                            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>الدولار (USD)</option>
                            <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>اليورو (EUR)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>المظهر</label>
                        <select id="settingTheme">
                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>فاتح</option>
                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>داكن</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="saveSettings()">حفظ الإعدادات</button>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function saveSettings() {
    const language = document.getElementById('settingLanguage').value;
    const currency = document.getElementById('settingCurrency').value;
    const theme = document.getElementById('settingTheme').value;

    db.updateSettings({
        language,
        currency,
        theme
    });

    showNotification('تم حفظ الإعدادات بنجاح', 'success');
}
