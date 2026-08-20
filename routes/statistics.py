"""Statistics API routes."""

from flask import Blueprint, jsonify
from models.patient import get_patient_stats

stats_bp = Blueprint('statistics', __name__)


@stats_bp.route('/api/statistics', methods=['GET'])
def statistics():
    """Get all analytics data."""
    stats = get_patient_stats()
    return jsonify(stats)
