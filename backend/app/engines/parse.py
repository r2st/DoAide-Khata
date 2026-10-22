"""Turn a spoken/typed sentence into a khata transaction.

Gemini does the heavy lifting; a keyword parser is the offline fallback so the
feature still works without an API key or when the model call fails.
"""

import json
import re

import httpx

from app.config import settings

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

RECEIVED_WORDS = (
    "received", "receive", "got", "paid", "payment", "jama", "mila", "mile", "mili", "wapas", "chukaya",
    "मिला", "मिले", "मिली", "जमा", "वापस", "चुकाया",
)
GAVE_WORDS = (
    "gave", "give", "given", "credit", "udhar", "udhaar", "diya", "diye", "di", "baki", "baaki",
    "दिया", "दिए", "दी", "उधार", "बाकी",
)

PROMPT = """You convert an Indian shopkeeper's khata (ledger) note into JSON.
The note may be Hindi, English or Hinglish. Known customers: {customers}.

Return JSON with:
- customer_name: the customer mentioned, spelled exactly as in the known list when it matches one, else as heard, or null
- type: "gave" if the shopkeeper gave goods/money on credit (udhar diya), "received" if the customer paid (paise mile / jama)
- amount: number in rupees (convert words like "paanch sau" to 500), or null
- note: short item/reason in the note's language, or ""

Note: {text}"""

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "customer_name": {"type": "STRING", "nullable": True},
        "type": {"type": "STRING", "enum": ["gave", "received"]},
        "amount": {"type": "NUMBER", "nullable": True},
        "note": {"type": "STRING"},
    },
    "required": ["type", "amount", "note"],
}


# Hindi voice typing often returns Devanagari digits ("५००").
DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
NUMBER = r"\d[\d,]*(?:\.\d{1,2})?"
# "₹500", "rs 500", "500 rupaye" beat a bare number like the "2" in "2 kg".
MONEY = re.compile(
    rf"(?:₹|\brs\.?|\binr)\s*({NUMBER})|({NUMBER})\s*(?:rs\b|rupees?\b|rupaye\b|rupay\b|रुपये|रुपए|रुपया)",
    re.IGNORECASE,
)
# "Ramesh ko 500 ...", "सीता से ...": the word(s) before ko/se/ne name the customer.
NAME_BEFORE = re.compile(r"^\s*([^\d₹,]+?)\s+(?:ko|se|ne|को|से|ने)(?=\s|$)", re.IGNORECASE)
NOT_NAMES = {"maine", "mene", "humne", "aaj", "kal", "मैंने", "हमने", "आज", "कल"}


def _words(text: str) -> list[str]:
    return re.findall(r"[\wऀ-ॿ]+", text.lower())


def match_customer(text: str, customers: list[str]) -> str | None:
    lowered = text.lower()
    # Longest name first so "Ramesh Kumar" wins over "Ramesh".
    for name in sorted(customers, key=len, reverse=True):
        if name and name.lower() in lowered:
            return name
    return None


def _amount(text: str) -> float | None:
    money = MONEY.search(text)
    if money:
        raw = money.group(1) or money.group(2)
    else:
        numbers = re.findall(NUMBER, text)
        if not numbers:
            return None
        raw = max(numbers, key=lambda n: float(n.replace(",", "")))
    value = float(raw.replace(",", ""))
    return value if value > 0 else None


def guess_name(text: str) -> str | None:
    m = NAME_BEFORE.match(text)
    if not m:
        return None
    words = [w for w in m.group(1).split() if w.lower() not in NOT_NAMES]
    if not words or len(words) > 3:
        return None
    name = " ".join(words)
    return name[:1].upper() + name[1:]


def rule_parse(text: str, customers: list[str]) -> dict:
    text = text.translate(DEVANAGARI_DIGITS)
    words = _words(text)
    amount = _amount(text)

    # An explicit payment word wins ("500 wapas diye" is a payment); otherwise a
    # credit word, then "X se ..." hints money came from the customer.
    if any(w in RECEIVED_WORDS for w in words):
        tx_type = "received"
    elif any(w in GAVE_WORDS for w in words):
        tx_type = "gave"
    elif "se" in words or "से" in words:
        tx_type = "received"
    else:
        tx_type = "gave"

    name = match_customer(text, customers) or guess_name(text)
    return {"customer_name": name, "type": tx_type, "amount": amount, "note": "", "source": "rules"}


def _clean(result: dict, text: str, customers: list[str]) -> dict:
    tx_type = result.get("type") if result.get("type") in ("gave", "received") else "gave"
    amount = result.get("amount")
    amount = round(float(amount), 2) if isinstance(amount, (int, float)) and amount > 0 else None
    name = result.get("customer_name") or None
    if name:
        known = {c.lower(): c for c in customers}
        name = known.get(str(name).lower(), match_customer(str(name), customers) or str(name))
    else:
        name = match_customer(text, customers) or guess_name(text.translate(DEVANAGARI_DIGITS))
    note = str(result.get("note") or "")[:120]
    return {"customer_name": name, "type": tx_type, "amount": amount, "note": note, "source": "ai"}


async def gemini_parse(text: str, customers: list[str]) -> dict:
    body = {
        "contents": [{"parts": [{"text": PROMPT.format(customers=json.dumps(customers[:200], ensure_ascii=False), text=text)}]}],
        "generationConfig": {"responseMimeType": "application/json", "responseSchema": RESPONSE_SCHEMA, "temperature": 0},
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            GEMINI_URL.format(model=settings.gemini_model),
            headers={"x-goog-api-key": settings.gemini_api_key},
            json=body,
        )
    resp.raise_for_status()
    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return _clean(json.loads(raw), text, customers)


async def parse_transaction(text: str, customers: list[str]) -> dict:
    if settings.gemini_api_key:
        try:
            return await gemini_parse(text, customers)
        except (httpx.HTTPError, KeyError, IndexError, ValueError, TypeError):
            pass
    return rule_parse(text, customers)
