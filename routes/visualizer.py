"""Algorithm Visualizer routes — provides heap data for tree visualization."""

from flask import Blueprint, request, jsonify
from datetime import datetime
from models.patient import create_patient, delete_all_patients

viz_bp = Blueprint('visualizer', __name__)

# Counter for demo patients in the visualizer
_viz_counter = 0
_viz_names = [
    'Arjun', 'Kavya', 'Vikram', 'Sneha', 'Dev',
    'Meera', 'Raj', 'Ananya', 'Kiran', 'Pooja',
    'Suresh', 'Lakshmi', 'Ganesh', 'Divya', 'Ramesh'
]


def _get_heap():
    from flask import current_app
    return current_app.config['HEAP']


@viz_bp.route('/api/visualizer/heap', methods=['GET'])
def get_heap():
    """Get the current heap as an array (for tree visualization)."""
    heap = _get_heap()
    heap_array = heap.get_all()
    return jsonify({
        'heap': heap_array,
        'size': heap.size()
    })


@viz_bp.route('/api/visualizer/insert-demo', methods=['POST'])
def insert_demo():
    """Insert a demo patient and return step-by-step operations."""
    global _viz_counter
    heap = _get_heap()

    data = request.get_json() or {}
    priority = data.get('priority', __import__('random').randint(1, 10))
    name = data.get('name', _viz_names[_viz_counter % len(_viz_names)])

    _viz_counter += 1
    patient_id = f'VIZ{_viz_counter:03d}'

    patient_data = {
        'patient_id': patient_id,
        'name': name,
        'age': 30,
        'gender': 'Male',
        'phone': '0000000000',
        'symptoms': 'Demo patient',
        'condition': 'Demo',
        'department': 'General',
        'priority': priority,
        'arrival_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'Waiting'
    }

    patient = create_patient(patient_data)
    steps = heap.insert(patient)

    return jsonify({
        'message': f'Inserted {name} with priority {priority}.',
        'patient': patient,
        'steps': steps,
        'heap': heap.get_all(),
        'size': heap.size()
    })


@viz_bp.route('/api/visualizer/extract-max', methods=['POST'])
def extract_max():
    """Extract the max and return step-by-step operations."""
    heap = _get_heap()

    if heap.is_empty():
        return jsonify({'error': 'Heap is empty.', 'steps': [], 'heap': [], 'size': 0}), 200

    patient, steps = heap.extract_max()

    # Update DB status
    from models.patient import update_patient_status
    update_patient_status(patient['id'], 'Completed')

    return jsonify({
        'message': f'Extracted {patient["name"]} (Priority {patient["priority"]}).',
        'patient': patient,
        'steps': steps,
        'heap': heap.get_all(),
        'size': heap.size()
    })


@viz_bp.route('/api/visualizer/reset', methods=['POST'])
def reset_viz():
    """Reset the visualizer heap."""
    global _viz_counter
    _viz_counter = 0
    heap = _get_heap()
    heap.clear()
    delete_all_patients()
    return jsonify({'message': 'Heap reset.', 'heap': [], 'size': 0})
