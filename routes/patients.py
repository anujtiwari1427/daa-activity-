"""Patient registration, search, and detail routes."""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models.patient import (
    create_patient, get_all_patients, get_patient_by_id,
    get_patient_by_db_id, update_patient_status, search_patients
)

patients_bp = Blueprint('patients', __name__)


def _get_heap():
    """Get the global Max Heap instance from the Flask app."""
    from flask import current_app
    return current_app.config['HEAP']


@patients_bp.route('/api/patients', methods=['POST'])
def register_patient():
    """Register a new patient → insert into DB and Max Heap."""
    data = request.get_json()

    # ─── Validation ──────────────────────────────────────────
    required = ['patient_id', 'name', 'priority']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'Field "{field}" is required.'}), 400

    priority = data.get('priority')
    if not isinstance(priority, int) or not (1 <= priority <= 10):
        return jsonify({'error': 'Priority must be between 1 and 10.'}), 400

    # Check duplicate patient_id
    existing = get_patient_by_id(data['patient_id'])
    if existing:
        return jsonify({'error': f'Patient ID {data["patient_id"]} already exists.'}), 400

    # Set arrival time
    if not data.get('arrival_time'):
        data['arrival_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # ─── Create in database ──────────────────────────────────
    patient = create_patient(data)

    # ─── Insert into Max Heap ────────────────────────────────
    heap = _get_heap()
    steps = heap.insert(patient)

    # Find queue position
    sorted_queue = heap.get_sorted()
    position = next(
        (i + 1 for i, p in enumerate(sorted_queue) if p['id'] == patient['id']),
        heap.size()
    )

    return jsonify({
        'message': f'Patient registered successfully. Priority: {priority}. Current Queue Position: {position}.',
        'patient': patient,
        'heap_steps': steps,
        'queue_position': position
    }), 201


@patients_bp.route('/api/patients', methods=['GET'])
def list_patients():
    """List all patients with optional search and filters."""
    query = request.args.get('q', '')
    status = request.args.get('status', '')
    priority_min = request.args.get('priority_min', '')
    priority_max = request.args.get('priority_max', '')

    priority_filter = None
    if priority_min and priority_max:
        priority_filter = list(range(int(priority_min), int(priority_max) + 1))

    status_filter = None
    if status:
        status_filter = [s.strip() for s in status.split(',')]

    patients = search_patients(query, priority_filter, status_filter)
    return jsonify({'patients': patients})


@patients_bp.route('/api/patients/<patient_id>', methods=['GET'])
def patient_detail(patient_id):
    """Get details of a single patient."""
    # Try by custom patient_id first, then by db id
    patient = get_patient_by_id(patient_id)
    if not patient:
        try:
            patient = get_patient_by_db_id(int(patient_id))
        except (ValueError, TypeError):
            pass

    if not patient:
        return jsonify({'error': 'Patient not found.'}), 404

    return jsonify({'patient': patient})


@patients_bp.route('/api/patients/<int:db_id>/status', methods=['PUT'])
def change_status(db_id):
    """Update a patient's status."""
    data = request.get_json()
    new_status = data.get('status')
    doctor = data.get('doctor', '')

    if new_status not in ('Waiting', 'In Treatment', 'Completed'):
        return jsonify({'error': 'Invalid status.'}), 400

    patient = update_patient_status(db_id, new_status, doctor)
    if not patient:
        return jsonify({'error': 'Patient not found.'}), 404

    # If completed or in treatment, remove from heap
    heap = _get_heap()
    if new_status in ('In Treatment', 'Completed'):
        heap.remove_by_id(db_id)

    return jsonify({'message': f'Status updated to {new_status}.', 'patient': patient})
