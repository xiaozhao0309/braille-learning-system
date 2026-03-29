import sqlite3
from datetime import datetime

# Database file name
DB_NAME = "braille.db"

# Initialize database and create table if it does not exist
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create table for storing practice records
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


# Save one practice record into database
def save_record(expected, actual, is_correct):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Insert a new record
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
 
# Get summary statistics from database   
def get_summary():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM practice_records")
    total_attempts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM practice_records WHERE is_correct = 1")
    correct_attempts = cursor.fetchone()[0]

    conn.close()

    accuracy = 0
    if total_attempts > 0:
        accuracy = round(correct_attempts / total_attempts, 2)

    # Return summary as a dictionary
    return {
        "totalAttempts": total_attempts,
        "correctAttempts": correct_attempts,
        "accuracy": accuracy
    }