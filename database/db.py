"""
Database connection and initialization module.
Supports SQLite (default) with MySQL-ready structure.
"""

import os
import sqlite3


DB_PATH = None


def _get_db_path():
    """Get the database file path (supports Vercel /tmp writable directory)."""
    global DB_PATH
    if DB_PATH is None:
        if os.environ.get('VERCEL') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
            # Vercel serverless functions have a read-only root; /tmp is the writable folder
            DB_PATH = os.path.join('/tmp', 'hospital.db')
        else:
            base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            DB_PATH = os.path.join(base, 'database', 'hospital.db')
    return DB_PATH


def get_db():
    """
    Get a database connection.
    Returns a sqlite3 Connection with Row factory for dict-like access.
    """
    db_path = _get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Access columns by name
    conn.execute("PRAGMA journal_mode=WAL")  # Better concurrent access
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """
    Initialize the database: create tables and seed demo users.
    Safe to call multiple times (uses IF NOT EXISTS).
    """
    db_path = _get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = get_db()
    cursor = conn.cursor()

    # Read and execute schema
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema = f.read()
    cursor.executescript(schema)

    # Seed demo users (skip if already exist)
    demo_users = [
        ('admin',        'admin',        'Admin'),
        ('doctor',       'doctor',       'Doctor'),
        ('receptionist', 'receptionist', 'Receptionist'),
    ]
    for username, password, role in demo_users:
        cursor.execute(
            "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
            (username, password, role)
        )

    conn.commit()
    conn.close()
    print(f"[DB] Database initialized at {db_path}")


def close_db(conn):
    """Close a database connection."""
    if conn:
        conn.close()
