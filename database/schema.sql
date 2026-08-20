-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Hospital Queue Management — Database Schema                ║
-- ║  Compatible with SQLite and MySQL                           ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id      VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    age             INTEGER,
    gender          VARCHAR(10),
    phone           VARCHAR(15),
    symptoms        TEXT,
    condition       VARCHAR(50),
    department      VARCHAR(50),
    priority        INTEGER      NOT NULL CHECK(priority BETWEEN 1 AND 10),
    arrival_time    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(20)  DEFAULT 'Waiting',
    doctor          VARCHAR(100) DEFAULT '',
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password        VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP
);
