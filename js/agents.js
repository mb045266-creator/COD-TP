/**
 * ملف إدارة الوكلاء - agents.js
 * يدير إضافة وتعديل وحذف الوكلاء
 */

function renderAgentsList() {
    const agents = db.getAgents();
    const container = document.getElementById('agentsContainer');
    
    if (!container) return;

    let html = `
        <div class="card">
            <div class="card-header">
                <h2>إدارة الوكلاء</h2>
                <button class="btn btn-primary" onclick="openAddAgentModal()">+ وكيل جديد</button>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>البريد الإلكتروني</th>
                            <th>الهاتف</th>
                            <th>الحالة</th>
                            <th>الطلبات المسندة</th>
                            <th>الموصلة</th>
                            <th>الملغاة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (agents.length === 0) {
        html += '<tr><td colspan="8" style="text-align: center; color: #999;">لا توجد وكلاء</td></tr>';
    } else {
        agents.forEach(agent => {
            const agentOrders = db.getOrdersByAgent(agent.id);
            const delivered = agentOrders.filter(o => o.status === 'delivered').length;
            const cancelled = agentOrders.filter(o => o.status === 'cancelled').length;

            html += `
                <tr>
                    <td><strong>${agent.name}</strong></td>
                    <td>${agent.email}</td>
                    <td>${agent.phone}</td>
                    <td><span class="badge badge-success">${agent.status}</span></td>
                    <td>${agentOrders.length}</td>
                    <td><span class="badge badge-success">${delivered}</span></td>
                    <td><span class="badge badge-danger">${cancelled}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editAgent('${agent.id}')">تعديل</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAgent('${agent.id}')">حذف</button>
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

function openAddAgentModal() {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'إضافة وكيل جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="addAgentForm" class="form-group">
            <div class="form-group">
                <label>اسم الوكيل *</label>
                <input type="text" id="newAgentName" placeholder="اسم الوكيل" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني *</label>
                <input type="email" id="newAgentEmail" placeholder="البريد الإلكتروني" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" id="newAgentPhone" placeholder="رقم الهاتف" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور *</label>
                <input type="password" id="newAgentPassword" placeholder="كلمة المرور" required>
            </div>
            <div class="form-group">
                <label>المنطقة</label>
                <input type="text" id="newAgentRegion" placeholder="المنطقة">
            </div>
            <div class="form-group">
                <label>الحد الأقصى للطلبات اليومية</label>
                <input type="number" id="newAgentMaxOrders" placeholder="10" value="10" min="1">
            </div>
        </form>
    `;

    document.getElementById('modalConfirm').onclick = () => {
        const name = document.getElementById('newAgentName').value;
        const email = document.getElementById('newAgentEmail').value;
        const phone = document.getElementById('newAgentPhone').value;
        const password = document.getElementById('newAgentPassword').value;
        const region = document.getElementById('newAgentRegion').value;
        const maxOrders = parseInt(document.getElementById('newAgentMaxOrders').value) || 10;

        if (!name || !email || !phone || !password) {
            showNotification('جميع الحقول المشار إليها مطلوبة', 'danger');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('البريد الإلكتروني غير صحيح', 'danger');
            return;
        }

        // تحقق من عدم تكرار البريد
        const existingAgent = db.getAgents().find(a => a.email === email);
        if (existingAgent) {
            showNotification('هذا البريد الإلكتروني مستخدم بالفعل', 'danger');
            return;
        }

        const agent = db.addAgent({
            name,
            email,
            phone,
            password, // في تطبيق حقيقي، يجب تشفير كلمة المرور
            region,
            maxOrders,
            status: 'active'
        });

        showNotification('تم إضافة الوكيل بنجاح', 'success');
        modal.classList.remove('active');
        renderAgentsList();
    };

    modal.classList.add('active');
}

function editAgent(agentId) {
    const agent = db.getAgent(agentId);
    if (!agent) return;

    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'تعديل الوكيل: ' + agent.name;
    document.getElementById('modalBody').innerHTML = `
        <form id="editAgentForm" class="form-group">
            <div class="form-group">
                <label>اسم الوكيل</label>
                <input type="text" id="editAgentName" value="${agent.name}" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" id="editAgentEmail" value="${agent.email}" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف</label>
                <input type="tel" id="editAgentPhone" value="${agent.phone}" required>
            </div>
            <div class="form-group">
                <label>المنطقة</label>
                <input type="text" id="editAgentRegion" value="${agent.region || ''}">
            </div>
            <div class="form-group">
                <label>الحد الأقصى للطلبات</label>
                <input type="number" id="editAgentMaxOrders" value="${agent.maxOrders || 10}" min="1">
            </div>
            <div class="form-group">
                <label>الحالة</label>
                <select id="editAgentStatus">
                    <option value="active" ${agent.status === 'active' ? 'selected' : ''}>نشط</option>
                    <option value="inactive" ${agent.status === 'inactive' ? 'selected' : ''}>غير نشط</option>
                    <option value="suspended" ${agent.status === 'suspended' ? 'selected' : ''}>معطل</option>
                </select>
            </div>
        </form>
    `;

    document.getElementById('modalConfirm').onclick = () => {
        db.updateAgent(agentId, {
            name: document.getElementById('editAgentName').value,
            email: document.getElementById('editAgentEmail').value,
            phone: document.getElementById('editAgentPhone').value,
            region: document.getElementById('editAgentRegion').value,
            maxOrders: parseInt(document.getElementById('editAgentMaxOrders').value),
            status: document.getElementById('editAgentStatus').value
        });

        showNotification('تم تحديث بيانات الوكيل', 'success');
        modal.classList.remove('active');
        renderAgentsList();
    };

    modal.classList.add('active');
}

function deleteAgent(agentId) {
    if (confirm('هل أنت متأكد من حذف هذا الوكيل؟')) {
        if (db.deleteAgent(agentId)) {
            showNotification('تم حذف الوكيل بنجاح', 'success');
            renderAgentsList();
        }
    }
}
