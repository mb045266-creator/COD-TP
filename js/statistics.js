/**
 * ملف الإحصائيات - statistics.js
 * يعرض إحصائيات مفصلة عن الطلبات والأداء
 */

function renderStatistics() {
    const stats = db.getStatistics();
    const orders = db.getOrders();
    const agents = db.getAgents();
    const container = document.getElementById('statisticsContainer');
    
    if (!container) return;

    const deliveryRate = calculatePercentage(stats.delivered, stats.total);
    const cancelRate = calculatePercentage(stats.cancelled, stats.total);
    const revenue = db.getTotalRevenue();

    let html = `
        <h2>الإحصائيات والتقارير</h2>
        
        <div class="grid grid-4">
            <div class="stat-card">
                <div class="stat-label">إجمالي الطلبات</div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">الطلبات المعلقة</div>
                <div class="stat-value">${stats.pending}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-label">الطلبات الموصلة</div>
                <div class="stat-value">${stats.delivered}</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-label">الطلبات الملغاة</div>
                <div class="stat-value">${stats.cancelled}</div>
            </div>
        </div>

        <div class="grid grid-3" style="margin-top: 30px;">
            <div class="card">
                <div class="card-header">
                    <h3>معدل الإيصال</h3>
                </div>
                <div class="card-body">
                    <div class="stat-value" style="color: #27ae60;">${deliveryRate}%</div>
                    <p>${stats.delivered} من ${stats.total} طلب</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>معدل الإلغاء</h3>
                </div>
                <div class="card-body">
                    <div class="stat-value" style="color: #e74c3c;">${cancelRate}%</div>
                    <p>${stats.cancelled} من ${stats.total} طلب</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>الإيرادات الإجمالية</h3>
                </div>
                <div class="card-body">
                    <div class="stat-value" style="color: #27ae60;">${formatCurrency(revenue)}</div>
                    <p>من الطلبات الموصلة</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>أداء الوكلاء</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>اسم الوكيل</th>
                            <th>الطلبات المسندة</th>
                            <th>الموصلة</th>
                            <th>الملغاة</th>
                            <th>معدل النجاح</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    agents.forEach(agent => {
        const agentOrders = db.getOrdersByAgent(agent.id);
        const delivered = agentOrders.filter(o => o.status === 'delivered').length;
        const cancelled = agentOrders.filter(o => o.status === 'cancelled').length;
        const successRate = agentOrders.length > 0 ? calculatePercentage(delivered, agentOrders.length) : 0;

        html += `
            <tr>
                <td><strong>${agent.name}</strong></td>
                <td>${agentOrders.length}</td>
                <td><span class="badge badge-success">${delivered}</span></td>
                <td><span class="badge badge-danger">${cancelled}</span></td>
                <td>${successRate}%</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>توزيع الطلبات حسب الحالة</h3>
            </div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="padding: 15px; background: #ecf0f1; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${stats.pending}</div>
                        <div style="color: #7f8c8d; margin-top: 5px;">قيد الانتظار</div>
                        <div style="color: #95a5a6; font-size: 12px; margin-top: 5px;">${calculatePercentage(stats.pending, stats.total)}%</div>
                    </div>
                    <div style="padding: 15px; background: #ecf0f1; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #16a085;">${stats.confirmed}</div>
                        <div style="color: #7f8c8d; margin-top: 5px;">مؤكدة</div>
                        <div style="color: #95a5a6; font-size: 12px; margin-top: 5px;">${calculatePercentage(stats.confirmed, stats.total)}%</div>
                    </div>
                    <div style="padding: 15px; background: #ecf0f1; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${stats.shipped}</div>
                        <div style="color: #7f8c8d; margin-top: 5px;">مُرسلة</div>
                        <div style="color: #95a5a6; font-size: 12px; margin-top: 5px;">${calculatePercentage(stats.shipped, stats.total)}%</div>
                    </div>
                    <div style="padding: 15px; background: #ecf0f1; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${stats.delivered}</div>
                        <div style="color: #7f8c8d; margin-top: 5px;">موصلة</div>
                        <div style="color: #95a5a6; font-size: 12px; margin-top: 5px;">${calculatePercentage(stats.delivered, stats.total)}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}
