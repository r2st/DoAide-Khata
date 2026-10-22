import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    """Minimal .env loader so local runs pick up secrets without extra deps."""
    env_file = BACKEND_DIR / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.port = int(os.getenv("PORT", "3101"))
        self.site_url = os.getenv("SITE_URL", "https://khata.doaide.com").rstrip("/")
        self.db_path = os.getenv("KHATA_DB_PATH", str(BACKEND_DIR / "khata.db"))
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        # Signs session tokens; must be set in production so sessions survive restarts.
        self.session_secret = os.getenv("SESSION_SECRET", "") or os.urandom(32).hex()
        self.session_days = int(os.getenv("SESSION_DAYS", "30"))
        self.pdf_font_path = os.getenv("KHATA_PDF_FONT", "")
        self.cors_origins = [
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "http://localhost:3102,https://khata.doaide.com").split(",")
            if o.strip()
        ]


settings = Settings()
