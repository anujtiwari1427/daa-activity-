"""Authentication routes."""

from flask import Blueprint, request, jsonify
from database.db import get_db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/login', methods=['POST'])
def login():
    """Authenticate a user and return their role."""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    ).fetchone()
    conn.close()

    if user is None:
        return jsonify({'error': 'Invalid credentials.'}), 401

    return jsonify({
        'message': 'Login successful.',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'role': user['role']
        }
    })


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    """Log out (client-side session clear)."""
    return jsonify({'message': 'Logged out successfully.'})
