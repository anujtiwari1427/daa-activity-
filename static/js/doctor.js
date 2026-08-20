/**
 * Doctor Dashboard — call next patient, complete treatment.
 */

let currentTreatingPatient = null;

async function loadDoctorDashboard() {
    try {
        // Load next patient
        const nextRes = await fetch(`${API}/api/doctor/next`);
        const nextData = await nextRes.json();
        renderDoctorNextPatient(nextData.patient);

        // Load in-treatment patients
        const treatRes = await fetch(`${API}/api/doctor/in-treatment`);
        const treatData = await treatRes.json();
        renderDoctorInTreatment(treatData.patients || []);

        // Load completed patients
        const compRes = await fetch(`${API}/api/patients?status=Completed`);
        const compData = await compRes.json();
        renderDoctorCompleted((compData.patients || []).slice(0, 5));

    } catch (err) {
        console.error('Doctor dashboard error:', err);
    }
}

function renderDoctorNextPatient(patient) {
    const container = document.getElementById('doctor-next-patient');

    if (!patient) {
        container.innerHTML = `
            <div class="empty-state-card">
                <i class="fas fa-check-circle"></i>
                <p>No patients are currently waiting.</p>
            </div>`;
        return;
    }

    const color = getPriorityColor(patient.priority);
    const arrivalTime = new Date(patient.arrival_time);
    const now = new Date();
    const waitMinutes = Math.max(0, Math.round((now - arrivalTime) / 60000));

    container.innerHTML = `
        <div class="doctor-next-info">
            <div class="patient-priority-big" style="color:${color}">${patient.priority}</div>
            <div class="patient-name-big">${patient.name}</div>
            <div class="patient-condition">${patient.condition || '—'}</div>
            <div class="patient-wait">
                <i class="fas fa-clock"></i> Waiting: ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}
                &nbsp;·&nbsp;
                <i class="fas fa-id-card"></i> ${patient.patient_id}
                &nbsp;·&nbsp;
                ${getPriorityBadge(patient.priority)}
            </div>
            <div class="doctor-actions">
                <button class="btn btn-primary btn-lg" onclick="doctorCallNext()">
                    <i class="fas fa-bullhorn"></i> Call Next Patient
                </button>
            </div>
        </div>`;
}

async function doctorCallNext() {
    try {
        const res = await fetch(`${API}/api/doctor/call`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error || 'No patients waiting.', 'error');
            return;
        }
        currentTreatingPatient = data.patient;
        showToast(data.message);
        loadDoctorDashboard();
    } catch (err) {
        showToast('Error calling patient.', 'error');
    }
}

async function doctorComplete(dbId) {
    try {
        const res = await fetch(`${API}/api/doctor/complete/${dbId}`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
            showToast(data.error, 'error');
            return;
        }
        showToast(data.message);
        loadDoctorDashboard();
    } catch (err) {
        showToast('Error completing treatment.', 'error');
    }
}

function renderDoctorInTreatment(patients) {
    const container = document.getElementById('doctor-in-treatment');
    if (patients.length === 0) {
        container.innerHTML = '<div class="empty-state-small">No patients in treatment.</div>';
        return;
    }

    container.innerHTML = patients.map(p => `
        <div class="doctor-patient-item">
            <div class="doctor-patient-item-info">
                <h4>${p.name}</h4>
                <span>${p.condition || '—'} · Priority ${p.priority}</span>
            </div>
            <button class="btn btn-sm btn-success" onclick="doctorComplete(${p.id})">
                <i class="fas fa-check"></i> Complete
            </button>
        </div>
    `).join('');
}

function renderDoctorCompleted(patients) {
    const container = document.getElementById('doctor-completed');
    if (patients.length === 0) {
        container.innerHTML = '<div class="empty-state-small">No completed treatments yet.</div>';
        return;
    }

    container.innerHTML = patients.map(p => `
        <div class="doctor-patient-item">
            <div class="doctor-patient-item-info">
                <h4>${p.name}</h4>
                <span>${p.condition || '—'} · Priority ${p.priority}</span>
            </div>
            ${getStatusBadge('Completed')}
        </div>
    `).join('');
}
