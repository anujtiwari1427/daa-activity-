/**
 * Patient Details Page — profile view, search, and timeline.
 */

async function searchPatientDetails() {
    const query = document.getElementById('details-search').value.trim();
    if (!query) {
        showToast('Please enter a Patient ID or name.', 'error');
        return;
    }

    try {
        // Try by patient_id first
        let res = await fetch(`${API}/api/patients/${encodeURIComponent(query)}`);
        let data = await res.json();

        if (!res.ok || !data.patient) {
            // Try searching
            res = await fetch(`${API}/api/patients?q=${encodeURIComponent(query)}`);
            data = await res.json();
            if (data.patients && data.patients.length > 0) {
                data.patient = data.patients[0];
            } else {
                showToast('Patient not found.', 'error');
                return;
            }
        }

        renderPatientDetail(data.patient);
    } catch (err) {
        showToast('Error searching for patient.', 'error');
    }
}

function renderPatientDetail(p) {
    const content = document.getElementById('patient-detail-content');
    content.style.display = 'block';

    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-pid').textContent = p.patient_id;
    document.getElementById('detail-age').textContent = p.age || '—';
    document.getElementById('detail-gender').textContent = p.gender || '—';
    document.getElementById('detail-phone').textContent = p.phone || '—';
    document.getElementById('detail-dept').textContent = p.department || '—';
    document.getElementById('detail-condition').textContent = p.condition || '—';
    document.getElementById('detail-symptoms').textContent = p.symptoms || '—';
    document.getElementById('detail-priority').textContent = `${p.priority} / 10`;
    document.getElementById('detail-arrival').textContent = p.arrival_time || '—';
    document.getElementById('detail-doctor').textContent = p.doctor || 'Not assigned';

    // Status badge
    const statusBadge = document.getElementById('detail-status-badge');
    statusBadge.innerHTML = p.status;
    statusBadge.className = 'badge';
    if (p.status === 'Waiting') statusBadge.classList.add('badge-warning');
    else if (p.status === 'In Treatment') statusBadge.classList.add('badge-info');
    else if (p.status === 'Completed') statusBadge.classList.add('badge-success');

    // Priority badge
    const priBadge = document.getElementById('detail-priority-badge');
    priBadge.innerHTML = `Priority ${p.priority}`;
    priBadge.className = 'badge';
    if (p.priority >= 9) priBadge.classList.add('badge-danger');
    else if (p.priority >= 5) priBadge.classList.add('badge-warning');
    else priBadge.classList.add('badge-success');

    // Timeline
    const statuses = ['Registered', 'Waiting', 'In Treatment', 'Completed'];
    const currentIndex = p.status === 'Waiting' ? 1 : p.status === 'In Treatment' ? 2 : p.status === 'Completed' ? 3 : 0;

    document.getElementById('tl-waiting').className = `timeline-step ${currentIndex >= 1 ? (currentIndex === 1 ? 'current' : 'completed') : ''}`;
    document.getElementById('tl-treatment').className = `timeline-step ${currentIndex >= 2 ? (currentIndex === 2 ? 'current' : 'completed') : ''}`;
    document.getElementById('tl-completed').className = `timeline-step ${currentIndex >= 3 ? 'completed' : ''}`;
}

async function loadAllPatientsList() {
    try {
        const res = await fetch(`${API}/api/patients`);
        const data = await res.json();
        const patients = data.patients || [];

        const tbody = document.getElementById('details-all-patients');
        if (patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No patients registered.</td></tr>';
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td><code>${p.patient_id}</code></td>
                <td>${p.name}</td>
                <td>${p.condition || '—'}</td>
                <td>${getPriorityBadge(p.priority)} ${p.priority}</td>
                <td>${getStatusBadge(p.status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="document.getElementById('details-search').value='${p.patient_id}';searchPatientDetails();">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

        // Show the detail content area
        document.getElementById('patient-detail-content').style.display = 'block';
    } catch (err) {
        console.error('Patient list error:', err);
    }
}

// Enter key support for search
document.getElementById('details-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPatientDetails();
});
