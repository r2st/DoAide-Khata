import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app import db
from app.auth import create_session, current_user, verify_google_credential
from app.config import settings
from app.engines.gst import compute_bill
from app.engines.merge import merge_ledgers
from app.engines.parse import parse_transaction
from app.engines.pdf import bill_pdf, ledger_pdf

router = APIRouter(prefix="/api")

AI_LIMIT_PER_HOUR = 60
_ai_hits: dict[str, deque] = defaultdict(deque)


def _rate_limit(request: Request) -> None:
    ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (request.client.host if request.client else "?")
    hits, now = _ai_hits[ip], time.time()
    while hits and hits[0] < now - 3600:
        hits.popleft()
    if len(hits) >= AI_LIMIT_PER_HOUR:
        raise HTTPException(429, "Too many requests, try again later")
    hits.append(now)


@router.get("/health")
def health():
    return {"status": "ok", "service": "DoAide Khata API"}


@router.get("/config")
def public_config():
    """Public runtime config so the static frontend needs no build-time secrets."""
    return {"googleClientId": settings.google_client_id, "aiEnabled": bool(settings.gemini_api_key)}


# --- Auth & sync -----------------------------------------------------------


class GoogleLogin(BaseModel):
    credential: str = Field(min_length=10, max_length=4096)


@router.post("/auth/google")
async def google_login(body: GoogleLogin):
    user = await verify_google_credential(body.credential)
    return {"token": create_session(user["sub"], user["email"]), "email": user["email"], "name": user["name"]}


@router.get("/auth/me")
def me(user: dict = Depends(current_user)):
    return {"email": user["email"]}


class LedgerDoc(BaseModel):
    customers: list[dict] = Field(default_factory=list)
    transactions: list[dict] = Field(default_factory=list)
    bills: list[dict] = Field(default_factory=list)
    settings: dict = Field(default_factory=dict)


@router.post("/sync")
def sync(body: LedgerDoc, user: dict = Depends(current_user)):
    try:
        merged = merge_ledgers(db.load_ledger(user["sub"]), body.model_dump())
    except ValueError as exc:
        raise HTTPException(413, str(exc)) from exc
    db.save_ledger(user["sub"], user["email"], merged)
    return merged


# --- AI ----------------------------------------------------------------------


class ParseRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    customers: list[str] = Field(default_factory=list, max_length=2000)


@router.post("/ai/parse")
async def ai_parse(body: ParseRequest, request: Request):
    _rate_limit(request)
    return await parse_transaction(body.text, [c[:80] for c in body.customers])


# --- Bills & PDFs ------------------------------------------------------------


class BillItem(BaseModel):
    name: str = Field(max_length=120)
    hsn: str = Field(default="", max_length=12)
    qty: float = Field(gt=0, le=1_000_000)
    rate: float = Field(ge=0, le=100_000_000)
    gstRate: float = Field(ge=0, le=28)


class BillRequest(BaseModel):
    shop: dict = Field(default_factory=dict)
    customer: dict = Field(default_factory=dict)
    number: str = Field(default="", max_length=40)
    date: str = Field(default="", max_length=20)
    items: list[BillItem] = Field(min_length=1, max_length=200)
    interState: bool = False


@router.post("/bill/calculate")
def bill_calculate(body: BillRequest):
    return compute_bill([i.model_dump() for i in body.items], body.interState)


@router.post("/pdf/bill")
def pdf_bill(body: BillRequest):
    data = body.model_dump()
    pdf = bill_pdf(body.shop, data)
    filename = f"bill-{body.number or 'receipt'}.pdf".replace("/", "-")
    return Response(pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


class LedgerTx(BaseModel):
    date: str = Field(max_length=20)
    type: str = Field(pattern="^(gave|received)$")
    amount: float = Field(ge=0, le=1_000_000_000)
    note: str = Field(default="", max_length=200)
    createdAt: float = 0


class LedgerPdfRequest(BaseModel):
    shop: dict = Field(default_factory=dict)
    customer: dict = Field(default_factory=dict)
    transactions: list[LedgerTx] = Field(default_factory=list, max_length=20_000)


@router.post("/pdf/ledger")
def pdf_ledger(body: LedgerPdfRequest):
    pdf = ledger_pdf(body.shop, body.customer, [t.model_dump() for t in body.transactions])
    return Response(pdf, media_type="application/pdf", headers={"Content-Disposition": 'attachment; filename="khata-statement.pdf"'})
