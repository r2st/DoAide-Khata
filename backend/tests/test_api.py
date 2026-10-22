import xml.etree.ElementTree as ET

import pytest
from fastapi import HTTPException

from app import auth
from app.auth import create_session, read_session

BILL = {
    "shop": {"shopName": "Sharma Kirana", "gstin": "09ABCDE1234F1Z5"},
    "customer": {"name": "Ramesh", "phone": "9876543210"},
    "number": "INV-1",
    "date": "2026-10-22",
    "items": [{"name": "Atta 10kg", "hsn": "1101", "qty": 1, "rate": 400, "gstRate": 5}],
}


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_config_is_public_and_has_no_secrets(client):
    data = client.get("/api/config").json()
    assert data == {"googleClientId": "test-client", "aiEnabled": False}


def test_sitemap_is_xml_with_all_routes(client):
    resp = client.get("/sitemap.xml")
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [e.text for e in ET.fromstring(resp.content).findall("s:url/s:loc", ns)]
    assert locs == [
        "https://khata.doaide.com/",
        "https://khata.doaide.com/bill",
        "https://khata.doaide.com/help",
        "https://khata.doaide.com/settings",
        "https://khata.doaide.com/guides",
        "https://khata.doaide.com/tools/whatsapp-reminder",
        "https://khata.doaide.com/guides/best-free-udhar-khata-app",
        "https://khata.doaide.com/guides/whatsapp-payment-reminder-message",
        "https://khata.doaide.com/guides/how-to-maintain-udhar-khata-kirana",
        "https://khata.doaide.com/guides/digital-bahi-khata-vs-paper-ledger",
        "https://khata.doaide.com/guides/upi-payments-for-kirana-shops",
        "https://khata.doaide.com/guides/gst-bill-format-for-small-shops",
        "https://khata.doaide.com/guides/khata-app-without-signup",
    ]


def test_robots(client):
    body = client.get("/robots.txt").text
    assert "Sitemap: https://khata.doaide.com/sitemap.xml" in body
    assert "Disallow: /api/" in body


def test_ai_parse_falls_back_to_rules(client):
    resp = client.post("/api/ai/parse", json={"text": "Ramesh ko 500 udhar diya", "customers": ["Ramesh"]})
    assert resp.status_code == 200
    assert resp.json()["type"] == "gave"
    assert resp.json()["amount"] == 500


def test_ai_parse_validates(client):
    assert client.post("/api/ai/parse", json={"text": ""}).status_code == 422


def test_bill_calculate(client):
    data = client.post("/api/bill/calculate", json=BILL).json()
    assert data["total"] == 420
    assert data["cgst"] == 10


def test_bill_requires_items(client):
    assert client.post("/api/bill/calculate", json={**BILL, "items": []}).status_code == 422


def test_bill_pdf(client):
    resp = client.post("/api/pdf/bill", json={**BILL, "interState": True})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content.startswith(b"%PDF")
    assert 'filename="bill-INV-1.pdf"' in resp.headers["content-disposition"]


def test_ledger_pdf_handles_unicode_names(client):
    resp = client.post(
        "/api/pdf/ledger",
        json={
            "shop": {"shopName": "Sharma <Kirana> & Sons"},
            "customer": {"name": "रमेश", "phone": "9876543210"},
            "transactions": [
                {"date": "2026-10-01", "type": "gave", "amount": 500, "note": "Atta"},
                {"date": "2026-10-05", "type": "received", "amount": 200, "note": ""},
            ],
        },
    )
    assert resp.status_code == 200
    assert resp.content.startswith(b"%PDF")


def test_ledger_pdf_rejects_bad_type(client):
    resp = client.post("/api/pdf/ledger", json={"transactions": [{"date": "x", "type": "stolen", "amount": 1}]})
    assert resp.status_code == 422


class TestSession:
    def test_roundtrip(self):
        token = create_session("u1", "a@b.com")
        assert read_session(token)["sub"] == "u1"

    def test_tampered(self):
        token = create_session("u1", "a@b.com")
        assert read_session(token[:-2] + "xx") is None
        assert read_session("garbage") is None

    def test_expired(self):
        token = create_session("u1", "a@b.com", now=1000)
        assert read_session(token, now=1000 + 31 * 86400) is None


def test_sync_requires_auth(client):
    assert client.post("/api/sync", json={}).status_code == 401
    assert client.post("/api/sync", json={}, headers={"Authorization": "Bearer nope"}).status_code == 401


def test_sync_merges_across_devices(client):
    headers = {"Authorization": f"Bearer {create_session('sync-user', 'shop@example.com')}"}
    first = client.post(
        "/api/sync",
        headers=headers,
        json={"customers": [{"id": "c1", "name": "Ramesh", "updatedAt": 1}], "settings": {"shopName": "A", "updatedAt": 1}},
    ).json()
    assert [c["id"] for c in first["customers"]] == ["c1"]

    second = client.post(
        "/api/sync",
        headers=headers,
        json={"customers": [{"id": "c2", "name": "Sita", "updatedAt": 2}], "transactions": [{"id": "t1", "updatedAt": 2}]},
    ).json()
    assert {c["id"] for c in second["customers"]} == {"c1", "c2"}
    assert second["transactions"] == [{"id": "t1", "updatedAt": 2}]
    assert second["settings"]["shopName"] == "A"

    other = {"Authorization": f"Bearer {create_session('someone-else', 'x@example.com')}"}
    assert client.post("/api/sync", headers=other, json={}).json()["customers"] == []


def test_google_login_issues_session(client, monkeypatch):
    async def fake_verify(credential):
        assert credential == "google-id-token-xyz"
        return {"sub": "g-1", "email": "shop@example.com", "name": "Shop"}

    monkeypatch.setattr("app.routers.api.verify_google_credential", fake_verify)
    data = client.post("/api/auth/google", json={"credential": "google-id-token-xyz"}).json()
    assert data["email"] == "shop@example.com"
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {data['token']}"})
    assert me.json() == {"email": "shop@example.com"}


@pytest.mark.anyio
async def test_verify_google_rejects_wrong_audience(monkeypatch):
    class FakeResp:
        status_code = 200

        def json(self):
            return {"aud": "other-client", "email_verified": "true", "sub": "1"}

    class FakeClient:
        def __init__(self, *a, **kw):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def get(self, *a, **kw):
            return FakeResp()

    monkeypatch.setattr(auth.httpx, "AsyncClient", FakeClient)
    with pytest.raises(HTTPException) as exc:
        await auth.verify_google_credential("token-value")
    assert exc.value.status_code == 401
