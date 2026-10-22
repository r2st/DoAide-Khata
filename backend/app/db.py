"""SQLite store for signed-in users' synced ledgers (one JSON document per user)."""

import json
import sqlite3
import time
from contextlib import contextmanager

from app.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS ledgers (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at REAL NOT NULL
)
"""


@contextmanager
def connect():
    conn = sqlite3.connect(settings.db_path)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with connect() as conn:
        conn.execute(SCHEMA)


def load_ledger(user_id: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT data FROM ledgers WHERE user_id = ?", (user_id,)).fetchone()
    return json.loads(row[0]) if row else None


def save_ledger(user_id: str, email: str, data: dict) -> None:
    with connect() as conn:
        conn.execute(
            "INSERT INTO ledgers (user_id, email, data, updated_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, data = excluded.data, "
            "updated_at = excluded.updated_at",
            (user_id, email, json.dumps(data, ensure_ascii=False), time.time()),
        )
