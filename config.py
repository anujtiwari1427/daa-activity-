"""
Configuration for Hospital Queue Management System.
Toggle DATABASE_TYPE to switch between SQLite and MySQL.
"""

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ─── Database Configuration ──────────────────────────────────────────
# Change to 'mysql' when migrating to MySQL
DATABASE_TYPE = 'sqlite'

# SQLite settings
SQLITE_DB_PATH = os.path.join(BASE_DIR, 'database', 'hospital.db')

# MySQL settings (fill in when ready to migrate)
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'hospital_queue'
}

# ─── Application Configuration ───────────────────────────────────────
SECRET_KEY = 'daa-hospital-queue-2026'
DEBUG = True
PORT = 5000

# ─── Demo Users ──────────────────────────────────────────────────────
DEMO_USERS = [
    {'username': 'admin',        'password': 'admin',        'role': 'Admin'},
    {'username': 'doctor',       'password': 'doctor',       'role': 'Doctor'},
    {'username': 'receptionist', 'password': 'receptionist', 'role': 'Receptionist'},
]
