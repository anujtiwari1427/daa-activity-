"""Doctor dashboard routes."""

from flask import Blueprint, jsonify
from models.patient import update_patient_status, get_all_patients

doctor_bp = Blueprint('doctor', __name__)


def _get_heap():
    from flask import current_app
    return current_app.config['HEAP']


@doctor_bp.route('/api/doctor/next', methods=['GET'])
def next_patient():
    """Peek at the highest-priority patient without removing them."""
    heap = _get_heap()
    patient = heap.peek()

    if patient is None:
        return jsonify({'error': 'No patients are currently waiting.', 'patient': None}), 200

    return jsonify({'patient': patient})


@doctor_bp.route('/api/doctor/call', methods=['POST'])
def call_patient():
    """Call the next highest-priority patient (extract max)."""
    heap = _get_heap()

    if heap.is_empty():
        return jsonify({'error': 'No patients are currently waiting.'}), 404

    patient, steps = heap.extract_max()
    updated = update_patient_status(patient['id'], 'In Treatment', 'Dr. Demo')

    # Get the new next patient
    next_p = heap.peek()

    return jsonify({
        'message': f'{patient["name"]} is now being treated.',
        'patient': updated,
        'next_patient': next_p,
        'heap_steps': steps,
        'remaining': heap.size()
    })


@doctor_bp.route('/api/doctor/complete/<int:db_id>', methods=['POST'])
def complete(db_id):
    """Complete treatment for a patient."""
    updated = update_patient_status(db_id, 'Completed')
    if not updated:
        return jsonify({'error': 'Patient not found.'}), 404

    heap = _get_heap()
    next_p = heap.peek()

    return jsonify({
        'message': f'{updated["name"]} treatment completed.',
        'patient': updated,
        'next_patient': next_p,
        'remaining': heap.size()
    })


@doctor_bp.route('/api/doctor/in-treatment', methods=['GET'])
def in_treatment():
    """Get patients currently in treatment."""
    patients = get_all_patients(status='In Treatment')
    return jsonify({'patients': patients})
