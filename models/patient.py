"""
Patient model — database operations for patient records.
"""

from database.db import get_db


def _row_to_dict(row):
    """Convert a sqlite3.Row to a plain dictionary."""
    if row is None:
        return None
    return dict(row)


def create_patient(data):
    """Insert a new patient into the database and return the record."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO patients (patient_id, name, age, gender, phone,
                              symptoms, condition, department, priority,
                              arrival_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['patient_id'], data['name'], data.get('age'),
        data.get('gender'), data.get('phone'), data.get('symptoms', ''),
        data.get('condition', ''), data.get('department', ''),
        data['priority'], data.get('arrival_time'), data.get('status', 'Waiting')
    ))
    conn.commit()
    patient_id = cursor.lastrowid
    patient = get_patient_by_db_id(patient_id)
    conn.close()
    return patient


def get_all_patients(status=None):
    """Get all patients, optionally filtered by status."""
    conn = get_db()
    if status:
        rows = conn.execute(
            "SELECT * FROM patients WHERE status = ? ORDER BY priority DESC, arrival_time ASC",
            (status,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM patients ORDER BY priority DESC, arrival_time ASC"
        ).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def get_patient_by_id(patient_id):
    """Get a patient by their custom patient_id (e.g., 'P001')."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM patients WHERE patient_id = ?", (patient_id,)
    ).fetchone()
    conn.close()
    return _row_to_dict(row)


def get_patient_by_db_id(db_id):
    """Get a patient by their database primary key."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM patients WHERE id = ?", (db_id,)
    ).fetchone()
    conn.close()
    return _row_to_dict(row)


def update_patient_status(db_id, status, doctor=''):
    """Update a patient's status and optionally assign a doctor."""
    conn = get_db()
    if doctor:
        conn.execute(
            "UPDATE patients SET status = ?, doctor = ? WHERE id = ?",
            (status, doctor, db_id)
        )
    else:
        conn.execute(
            "UPDATE patients SET status = ? WHERE id = ?",
            (status, db_id)
        )
    conn.commit()
    patient = get_patient_by_db_id(db_id)
    conn.close()
    return patient


def search_patients(query='', priority_filter=None, status_filter=None):
    """Search patients by name/ID/condition with optional filters."""
    conn = get_db()
    sql = "SELECT * FROM patients WHERE 1=1"
    params = []

    if query:
        sql += " AND (name LIKE ? OR patient_id LIKE ? OR condition LIKE ?)"
        q = f"%{query}%"
        params.extend([q, q, q])

    if priority_filter:
        placeholders = ','.join('?' * len(priority_filter))
        sql += f" AND priority IN ({placeholders})"
        params.extend(priority_filter)

    if status_filter:
        placeholders = ','.join('?' * len(status_filter))
        sql += f" AND status IN ({placeholders})"
        params.extend(status_filter)

    sql += " ORDER BY priority DESC, arrival_time ASC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def get_patient_stats():
    """Get aggregate statistics about patients."""
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM patients").fetchone()['c']
    waiting = conn.execute("SELECT COUNT(*) as c FROM patients WHERE status='Waiting'").fetchone()['c']
    in_treatment = conn.execute("SELECT COUNT(*) as c FROM patients WHERE status='In Treatment'").fetchone()['c']
    completed = conn.execute("SELECT COUNT(*) as c FROM patients WHERE status='Completed'").fetchone()['c']
    emergency = conn.execute("SELECT COUNT(*) as c FROM patients WHERE priority >= 9").fetchone()['c']

    # Priority distribution
    critical = conn.execute("SELECT COUNT(*) as c FROM patients WHERE priority >= 9").fetchone()['c']
    serious = conn.execute("SELECT COUNT(*) as c FROM patients WHERE priority BETWEEN 5 AND 8").fetchone()['c']
    moderate = conn.execute("SELECT COUNT(*) as c FROM patients WHERE priority BETWEEN 3 AND 4").fetchone()['c']
    routine = conn.execute("SELECT COUNT(*) as c FROM patients WHERE priority BETWEEN 1 AND 2").fetchone()['c']

    conn.close()
    return {
        'total': total,
        'waiting': waiting,
        'in_treatment': in_treatment,
        'completed': completed,
        'emergency': emergency,
        'priority_distribution': {
            'critical': critical,
            'serious': serious,
            'moderate': moderate,
            'routine': routine
        },
        'status_distribution': {
            'waiting': waiting,
            'in_treatment': in_treatment,
            'completed': completed
        }
    }


def delete_all_patients():
    """Delete all patient records (used for reset)."""
    conn = get_db()
    conn.execute("DELETE FROM patients")
    conn.execute("DELETE FROM sqlite_sequence WHERE name='patients'")
    conn.commit()
    conn.close()
