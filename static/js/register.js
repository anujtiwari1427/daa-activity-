/**
 * Patient Registration Page — form validation and API submission.
 */

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const patientId = document.getElementById('reg-patient-id').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value;
    const gender = document.getElementById('reg-gender').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const department = document.getElementById('reg-department').value;
    const condition = document.getElementById('reg-condition').value.trim();
    const priority = parseInt(document.getElementById('reg-priority').value);
    const symptoms = document.getElementById('reg-symptoms').value.trim();

    // ─── Validation ─────────────────────────────────────────
    if (!patientId || !name || !condition) {
        showToast('Please complete all required fields.', 'error');
        return;
    }

    if (!priority || priority < 1 || priority > 10) {
        showToast('Priority must be between 1 and 10.', 'error');
        return;
    }

    const payload = {
        patient_id: patientId,
        name,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        phone: phone || null,
        department: department || null,
        condition,
        priority,
        symptoms: symptoms || ''
    };

    try {
        const res = await fetch(`${API}/api/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'Registration failed.', 'error');
            return;
        }

        showToast(data.message);
        document.getElementById('register-form').reset();
    } catch (err) {
        showToast('Server error during registration.', 'error');
    }
});
