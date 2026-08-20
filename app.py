"""
╔══════════════════════════════════════════════════════════════════════╗
║           Hospital Queue Management System                          ║
║                                                                      ║
║  A web application demonstrating Priority Queue using Max Heap       ║
║  for efficient patient prioritization in hospitals.                  ║
║                                                                      ║
║  Subject : Design and Analysis of Algorithms (DAA)                   ║
║  Stack   : Flask + SQLite + Vanilla JS                               ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python app.py
    → Server starts at http://localhost:5000
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from database.db import init_db
from heap.max_heap import MaxHeap
from routes import auth_bp, patients_bp, queue_bp, doctor_bp, stats_bp, viz_bp


def create_app():
    """Application factory."""
    app = Flask(
        __name__,
        static_folder='static',
        template_folder='templates'
    )
    app.config['SECRET_KEY'] = 'daa-hospital-queue-2026'

    # Enable CORS
    CORS(app)

    # ─── Initialize the global Max Heap ──────────────────────
    # This in-memory heap is the core data structure for the
    # priority queue. It's shared across all routes.
    app.config['HEAP'] = MaxHeap()

    # ─── Initialize Database ─────────────────────────────────
    init_db()

    # ─── Rebuild heap from database on startup ───────────────
    # Load any existing 'Waiting' patients into the heap
    from models.patient import get_all_patients
    waiting = get_all_patients(status='Waiting')
    if waiting:
        app.config['HEAP'].build_heap(waiting)
        print(f"[HEAP] Loaded {len(waiting)} waiting patients into the heap.")

    # ─── Register Blueprints ─────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(queue_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(viz_bp)

    # ─── Serve the Landing Page & App Portal ─────────────────
    @app.route('/')
    @app.route('/landing')
    def landing():
        return send_from_directory('templates', 'landing.html')

    @app.route('/portal')
    @app.route('/app')
    def portal():
        return send_from_directory('templates', 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n" + "=" * 60)
    print("  Hospital Queue Management System")
    print("  DAA Project — Priority Queue using Max Heap")
    print("=" * 60)
    print("  Server: http://localhost:5000")
    print("  Demo Logins: admin/admin, doctor/doctor, receptionist/receptionist")
    print("=" * 60 + "\n")
    app.run(debug=True, port=5000)
