"""Priority Queue routes — the core DAA demonstration."""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models.patient import (
    create_patient, get_all_patients, update_patient_status,
    delete_all_patients, get_patient_stats
)

queue_bp = Blueprint('queue', __name__)


def _get_heap():
    from flask import current_app
    return current_app.config['HEAP']


@queue_bp.route('/api/queue', methods=['GET'])
def get_queue():
    """Get the current priority queue (sorted by priority)."""
    heap = _get_heap()
    sorted_queue = heap.get_sorted()
    return jsonify({
        'queue': sorted_queue,
        'size': heap.size()
    })


@queue_bp.route('/api/queue/call-next', methods=['POST'])
def call_next():
    """
    Extract the highest-priority patient from the heap.
    This is the EXTRACT MAX operation — O(log n).
    """
    heap = _get_heap()

    if heap.is_empty():
        return jsonify({'error': 'No patients are currently waiting.'}), 404

    patient, steps = heap.extract_max()

    # Update status in database
    updated = update_patient_status(patient['id'], 'In Treatment', 'Dr. Demo')

    return jsonify({
        'message': f'{patient["name"]} has been called for treatment.',
        'patient': updated,
        'heap_steps': steps,
        'remaining': heap.size()
    })


@queue_bp.route('/api/queue/complete/<int:db_id>', methods=['POST'])
def complete_treatment(db_id):
    """Mark a patient as completed."""
    updated = update_patient_status(db_id, 'Completed')
    if not updated:
        return jsonify({'error': 'Patient not found.'}), 404

    heap = _get_heap()
    return jsonify({
        'message': f'{updated["name"]} treatment completed.',
        'patient': updated,
        'queue_size': heap.size()
    })


@queue_bp.route('/api/queue/load-demo', methods=['POST'])
def load_demo_data():
    """Load demo patients for college presentation."""
    heap = _get_heap()

    # Clear existing data
    delete_all_patients()
    heap.clear()

    # Demo patients as specified in requirements
    demo_patients = [
        {
            'patient_id': 'P001', 'name': 'Rahul Mehta', 'age': 28,
            'gender': 'Male', 'phone': '9876543210',
            'symptoms': 'High temperature, body ache',
            'condition': 'Fever', 'department': 'General Medicine',
            'priority': 2, 'status': 'Waiting'
        },
        {
            'patient_id': 'P002', 'name': 'Priya Sharma', 'age': 35,
            'gender': 'Female', 'phone': '9876543211',
            'symptoms': 'Chest pain, breathing difficulty',
            'condition': 'Emergency', 'department': 'Emergency',
            'priority': 10, 'status': 'Waiting'
        },
        {
            'patient_id': 'P003', 'name': 'Aman Gupta', 'age': 22,
            'gender': 'Male', 'phone': '9876543212',
            'symptoms': 'Mild headache',
            'condition': 'Headache', 'department': 'General Medicine',
            'priority': 1, 'status': 'Waiting'
        },
        {
            'patient_id': 'P004', 'name': 'Neha Patil', 'age': 30,
            'gender': 'Female', 'phone': '9876543213',
            'symptoms': 'Multiple fractures, head injury',
            'condition': 'Accident', 'department': 'Emergency',
            'priority': 9, 'status': 'Waiting'
        },
        {
            'patient_id': 'P005', 'name': 'Rohan Shah', 'age': 45,
            'gender': 'Male', 'phone': '9876543214',
            'symptoms': 'Arm fracture, swelling',
            'condition': 'Fracture', 'department': 'Orthopedics',
            'priority': 5, 'status': 'Waiting'
        },
    ]

    now = datetime.now()
    for i, p in enumerate(demo_patients):
        # Stagger arrival times by 1 minute each
        from datetime import timedelta
        p['arrival_time'] = (now - timedelta(minutes=len(demo_patients) - i)).strftime('%Y-%m-%d %H:%M:%S')
        patient = create_patient(p)
        heap.insert(patient)

    sorted_queue = heap.get_sorted()
    return jsonify({
        'message': f'{len(demo_patients)} demo patients loaded successfully.',
        'queue': sorted_queue,
        'size': heap.size()
    })


@queue_bp.route('/api/queue/reset', methods=['POST'])
def reset_queue():
    """Clear all patients and reset the heap."""
    delete_all_patients()
    heap = _get_heap()
    heap.clear()
    return jsonify({'message': 'Queue reset successfully.', 'size': 0})
