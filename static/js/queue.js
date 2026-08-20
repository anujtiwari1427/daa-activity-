/**
 * Patient Queue Page — live queue display, search, and filters.
 */

let allQueuePatients = [];
let currentPriorityFilter = 'all';
let currentStatusFilter = 'all';

async function loadQueue() {
    try {
        const res = await fetch(`${API}/api/patients`);
        const data = await res.json();
        allQueuePatients = data.patients || [];
        applyQueueFilters();
    } catch (err) {
        console.error('Queue load error:', err);
    }
}

function applyQueueFilters() {
    let filtered = [...allQueuePatients];

    // Search
    const search = document.getElementById('queue-search').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.patient_id.toLowerCase().includes(search) ||
            (p.condition || '').toLowerCase().includes(search)
        );
    }

    // Priority filter
    if (currentPriorityFilter !== 'all') {
        const ranges = {
            critical: [9, 10],
            serious: [5, 8],
            moderate: [3, 4],
            routine: [1, 2]
        };
        const [min, max] = ranges[currentPriorityFilter] || [1, 10];
        filtered = filtered.filter(p => p.priority >= min && p.priority <= max);
    }

    // Status filter
    if (currentStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === currentStatusFilter);
    }

    // Sort by priority desc, then arrival asc
    filtered.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (a.arrival_time || '').localeCompare(b.arrival_time || '');
    });

    renderQueueList(filtered);
}

function renderQueueList(patients) {
    const container = document.getElementById('queue-list');

    if (patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state-card">
                <i class="fas fa-inbox"></i>
                <p>No patients match your criteria.</p>
            </div>`;
        return;
    }

    // Separate waiting patients for ranking
    let waitingRank = 0;

    container.innerHTML = patients.map((p, i) => {
        const priorityClass = getPriorityClass(p.priority);
        const isWaiting = p.status === 'Waiting';
        if (isWaiting) waitingRank++;
        const rank = isWaiting ? waitingRank : '—';
        const rankClass = isWaiting && waitingRank <= 3 ? `queue-rank-${waitingRank}` : '';

        return `
        <div class="queue-card priority-${priorityClass}">
            <div class="queue-rank ${rankClass}">${rank}</div>
            <div class="queue-info">
                <h4>${p.name}</h4>
                <div class="queue-meta">
                    <span><i class="fas fa-id-card"></i> ${p.patient_id}</span>
                    <span><i class="fas fa-heartbeat"></i> ${p.condition || '—'}</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(p.arrival_time)}</span>
                </div>
            </div>
            <div class="queue-priority">
                <div class="queue-priority-value" style="color:${getPriorityColor(p.priority)}">${p.priority}</div>
                <div class="queue-priority-label">Priority</div>
            </div>
            <div>
                ${getStatusBadge(p.status)}
            </div>
            <div class="queue-actions">
                <button class="btn btn-sm btn-outline" onclick="viewPatient('${p.patient_id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${p.status === 'In Treatment' ? `
                    <button class="btn btn-sm btn-success" onclick="completePatient(${p.id})">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}

async function completePatient(dbId) {
    try {
        const res = await fetch(`${API}/api/queue/complete/${dbId}`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error, 'error');
            return;
        }
        showToast(data.message);
        loadQueue();
    } catch (err) {
        showToast('Error completing treatment.', 'error');
    }
}

// ─── Search & Filter Event Listeners ────────────────────────────
document.getElementById('queue-search').addEventListener('input', applyQueueFilters);

document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPriorityFilter = btn.dataset.filter;
        applyQueueFilters();
    });
});

document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-status]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatusFilter = btn.dataset.status;
        applyQueueFilters();
    });
});
