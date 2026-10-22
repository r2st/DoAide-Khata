"""Last-write-wins merge of ledger documents.

A ledger document looks like:
    {"customers": [...], "transactions": [...], "bills": [...], "settings": {...}}
Every record carries an `id` and an `updatedAt` (epoch ms). Deletions are
tombstones (`deleted: true`) so they propagate between devices.
"""

COLLECTIONS = ("customers", "transactions", "bills")
MAX_RECORDS = 50_000


def _ts(record: dict) -> float:
    value = record.get("updatedAt", 0)
    return value if isinstance(value, (int, float)) else 0


def merge_records(server: list, client: list) -> list:
    merged: dict[str, dict] = {}
    for record in [*server, *client]:
        if not isinstance(record, dict) or not isinstance(record.get("id"), str):
            continue
        current = merged.get(record["id"])
        if current is None or _ts(record) >= _ts(current):
            merged[record["id"]] = record
    return list(merged.values())


def merge_ledgers(server: dict | None, client: dict) -> dict:
    server = server or {}
    result: dict = {}
    for name in COLLECTIONS:
        records = merge_records(server.get(name) or [], client.get(name) or [])
        if len(records) > MAX_RECORDS:
            raise ValueError(f"Too many {name}")
        result[name] = records
    s_settings, c_settings = server.get("settings") or {}, client.get("settings") or {}
    result["settings"] = c_settings if _ts(c_settings) >= _ts(s_settings) else s_settings
    return result
