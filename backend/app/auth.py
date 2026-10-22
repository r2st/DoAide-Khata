"""Google ID-token verification and stateless HMAC session tokens."""

import base64
import hashlib
import hmac
import json
import time

import httpx
from fastapi import Header, HTTPException

from app.config import settings

TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def _sign(payload: str) -> str:
    return _b64(hmac.new(settings.session_secret.encode(), payload.encode(), hashlib.sha256).digest())


def create_session(user_id: str, email: str, now: float | None = None) -> str:
    now = now or time.time()
    payload = _b64(json.dumps({"sub": user_id, "email": email, "exp": int(now + settings.session_days * 86400)}).encode())
    return f"{payload}.{_sign(payload)}"


def read_session(token: str, now: float | None = None) -> dict | None:
    try:
        payload, sig = token.split(".", 1)
    except ValueError:
        return None
    if not hmac.compare_digest(sig, _sign(payload)):
        return None
    try:
        data = json.loads(_unb64(payload))
    except (ValueError, json.JSONDecodeError):
        return None
    if data.get("exp", 0) < (now or time.time()):
        return None
    return data


async def verify_google_credential(credential: str) -> dict:
    """Return {sub, email, name} for a valid Google ID token, else raise 401."""
    if not settings.google_client_id:
        raise HTTPException(503, "Google sign-in is not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(TOKENINFO_URL, params={"id_token": credential})
    if resp.status_code != 200:
        raise HTTPException(401, "Invalid Google credential")
    info = resp.json()
    if info.get("aud") != settings.google_client_id or info.get("email_verified") not in ("true", True):
        raise HTTPException(401, "Invalid Google credential")
    return {"sub": info["sub"], "email": info.get("email", ""), "name": info.get("name", "")}


def current_user(authorization: str = Header(default="")) -> dict:
    token = authorization.removeprefix("Bearer ").strip()
    user = read_session(token) if token else None
    if not user:
        raise HTTPException(401, "Sign in required")
    return user
