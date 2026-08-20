/**
 * Dashboard Page — loads stats and priority queue table.
 */

async function loadDashboard() {
    try {
        // Load stats
        const statsRes = await fetch(`${API}/api/statistics`);
        const stats = await statsRes.json();

        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-waiting').textContent = stats.waiting;
        document.getElementById('stat-treatment').textContent = stats.in_treatment;
        document.getElementById('stat-completed').textContent = stats.completed;
        document.getElementById('stat-emergency').textContent = stats.emergency;

        // Load queue
        const queueRes = await fetch(`${API}/api/queue`);
        const queueData = await queueRes.json();

        renderDashboardQueue(queueData.queue);
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

function renderDashboardQueue(queue) {
    const tbody = document.getElementById('dashboard-queue-body');

    if (!queue || queue.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No patients in queue. <a href="#" onclick="loadDemoData()">Load demo data</a> to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = queue.map((p, i) => `
        <tr>
            <td><span class="queue-rank ${i < 3 ? 'queue-rank-' + (i + 1) : ''}" style="width:28px;height:28px;font-size:0.75rem;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;${i < 3 ? 'color:#fff;' : 'background:var(--gray-100);'}">${i + 1}</span></td>
            <td><strong>${p.name}</strong></td>
            <td><code>${p.patient_id}</code></td>
            <td>${p.condition || '—'}</td>
            <td>${getPriorityBadge(p.priority)} <strong>${p.priority}</strong></td>
            <td>${getStatusBadge(p.status)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewPatient('${p.patient_id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
