import os
import tempfile

# Configure before the app is imported: isolated DB, no real Gemini/Google calls.
os.environ["KHATA_DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_CLIENT_ID"] = "test-client"
os.environ["SESSION_SECRET"] = "test-secret"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
