/**
 * ملف إدارة الطلبات - orders.js
 * يدير جميع عمليات الطلبات والتحديثات
 */

function renderOrdersList() {
    const orders = db.getOrders();
    const container = document.getElementById('ordersContainer');
    
    if (!container) return;

    let html = `
        <div class="card">
            <div class="card-header">
                <h2>إدارة الطلبات</h2>
                <button class="btn btn-primary" onclick="openAddOrderModal()">+ طلب جديد</button>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>رقم الطلب</th>
                            <th>العميل</th>
                            <th>الهاتف</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>الوكيل</th>
                            <th>التاريخ</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    if (orders.length === 0) {
        html += '<tr><td colspan="8" style="text-align: center; color: #999;">لا توجد طلبات</td></tr>';
    } else {
        orders.forEach(order => {
            const agent = order.assignedAgent ? db.getAgent(order.assignedAgent) : null;
            html += `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${order.customerName || 'N/A'}</td>
                    <td>${order.customerPhone || 'N/A'}</td>
                    <td>${formatCurrency(order.amount || 0)}</td>
                    <td>
                        <span class="badge badge-${getStatusBadgeColor(order.status)}">
                            ${order.status}
                        </span>
                    </td>
                    <td>${agent ? agent.name : 'لم يُسند'}</td>
                    <td>${formatDate(order.createdAt)}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="editOrder('${order.id}')">تعديل</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">حذف</button>
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

function getStatusBadgeColor(status) {
    const colors = {
        'pending': 'primary',
        'confirmed': 'info',
        'shipped': 'warning',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'primary';
}

function openAddOrderModal() {
    const agents = db.getAgents();
    let agentOptions = '<option value="">-- اختر وكيل --</option>';
    agents.forEach(agent => {
        agentOptions += `<option value="${agent.id}">${agent.name}</option>`;
    });

    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'إضافة طلب جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="addOrderForm" class="form-group">
            <div class="form-group">
                <label>اسم العميل *</label>
                <input type="text" id="newOrderCustomer" placeholder="اسم العميل" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" id="newOrderPhone" placeholder="رقم الهاتف" required>
            </div>
            <div class="form-group">
                <label>العنوان *</label>
                <textarea id="newOrderAddress" placeholder="عنوان التسليم" required></textarea>
            </div>
            <div class="form-group">
                <label>المبلغ *</label>
                <input type="number" id="newOrderAmount" placeholder="المبلغ" min="0" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea id="newOrderDescription" placeholder="وصف الطلب"></textarea>
            </div>
            <div class="form-group">
                <label>الوكيل</label>
                <select id="newOrderAgent">${agentOptions}</select>
            </div>
        </form>
    `;

    document.getElementById('modalConfirm').onclick = () => {
        const customer = document.getElementById('newOrderCustomer').value;
        const phone = document.getElementById('newOrderPhone').value;
        const address = document.getElementById('newOrderAddress').value;
        const amount = parseFloat(document.getElementById('newOrderAmount').value);
        const description = document.getElementById('newOrderDescription').value;
        const agent = document.getElementById('newOrderAgent').value;

        if (!customer || !phone || !address || !amount) {
            showNotification('جميع الحقول مطلوبة', 'danger');
            return;
        }

        const order = db.addOrder({
            customerName: customer,
            customerPhone: phone,
            address: address,
            amount: amount,
            description: description,
            assignedAgent: agent || null,
            status: 'pending'
        });

        showNotification('تم إضافة الطلب بنجاح', 'success');
        modal.classList.remove('active');
        renderOrdersList();
    };

    modal.classList.add('active');
}

function editOrder(orderId) {
    const order = db.getOrder(orderId);
    if (!order) return;

    const agents = db.getAgents();
    let agentOptions = '<option value="">-- لم يُسند --</option>';
    agents.forEach(agent => {
        agentOptions += `<option value="${agent.id}" ${order.assignedAgent === agent.id ? 'selected' : ''}>${agent.name}</option>`;
    });

    let statusOptions = '';
    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].forEach(status => {
        statusOptions += `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`;
    });

    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'تعديل الطلب: ' + order.id;
    document.getElementById('modalBody').innerHTML = `
        <form id="editOrderForm" class="form-group">
            <div class="form-group">
                <label>اسم العميل</label>
                <input type="text" id="editOrderCustomer" value="${order.customerName}" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف</label>
                <input type="tel" id="editOrderPhone" value="${order.customerPhone}" required>
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <textarea id="editOrderAddress" required>${order.address}</textarea>
            </div>
            <div class="form-group">
                <label>المبلغ</label>
                <input type="number" id="editOrderAmount" value="${order.amount}" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea id="editOrderDescription">${order.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>الحالة</label>
                <select id="editOrderStatus">${statusOptions}</select>
            </div>
            <div class="form-group">
                <label>الوكيل</label>
                <select id="editOrderAgent">${agentOptions}</select>
            </div>
        </form>
    `;

    document.getElementById('modalConfirm').onclick = () => {
        db.updateOrder(orderId, {
            customerName: document.getElementById('editOrderCustomer').value,
            customerPhone: document.getElementById('editOrderPhone').value,
            address: document.getElementById('editOrderAddress').value,
            amount: parseFloat(document.getElementById('editOrderAmount').value),
            description: document.getElementById('editOrderDescription').value,
            status: document.getElementById('editOrderStatus').value,
            assignedAgent: document.getElementById('editOrderAgent').value || null
        });

        showNotification('تم تحديث الطلب بنجاح', 'success');
        modal.classList.remove('active');
        renderOrdersList();
    };

    modal.classList.add('active');
}

function deleteOrder(orderId) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        const orders = db.get('orders') || [];
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders.splice(index, 1);
            db.save('orders', orders);
            showNotification('تم حذف الطلب بنجاح', 'success');
            renderOrdersList();
        }
    }
}

function assignOrderToAgent(orderId, agentId) {
    db.updateOrder(orderId, { assignedAgent: agentId });
    showNotification('تم إسناد الطلب للوكيل', 'success');
    renderOrdersList();
}

function updateOrderStatus(orderId, newStatus) {
    db.updateOrder(orderId, { status: newStatus });
    showNotification('تم تحديث حالة الطلب', 'success');
    renderOrdersList();
}

// Auto-assign orders to agents
function autoAssignOrders() {
    const orders = db.getOrders();
    const agents = db.getAgents();
    
    if (agents.length === 0) {
        showNotification('لا توجد وكلاء متاحين', 'danger');
        return;
    }

    let assignedCount = 0;
    let agentIndex = 0;

    orders.forEach(order => {
        if (!order.assignedAgent && order.status === 'pending') {
            const agent = agents[agentIndex % agents.length];
            db.updateOrder(order.id, { assignedAgent: agent.id });
            assignedCount++;
            agentIndex++;
        }
    });

    showNotification(`تم إسناد ${assignedCount} طلبات للوكلاء`, 'success');
    renderOrdersList();
}
