import sqlite3
from datetime import datetime

DB_NAME = "braille.db"


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expected TEXT,
        actual TEXT,
        is_correct INTEGER,
        created_at TEXT
    )
    """)

    conn.commit()
    conn.close()


def save_record(expected, actual, is_correct):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO practice_records (expected, actual, is_correct, created_at)
    VALUES (?, ?, ?, ?)
    """, (
        str(expected),
        str(actual),
        int(is_correct),
        datetime.now().isoformat()
    ))

    conn.commit()
    conn.close()