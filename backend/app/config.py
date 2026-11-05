import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    PROJECT_NAME = "ProcureEase 2.0"
    SECRET_KEY = os.getenv("SECRET_KEY", "procureease-2-secure-random-key-prod-2026")
    
    # Session Cookie Security
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"
    PERMANENT_SESSION_LIFETIME = 7 * 24 * 60 * 60 # 7 days

    # SQLite Database Configuration (with PostgreSQL URL compatibility for Render/Supabase)
    INSTANCE_DIR = BASE_DIR / "instance"
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_PATH = INSTANCE_DIR / "procureease.db"
    db_env = os.getenv("DATABASE_URL")
    if not db_env or "sqlite:///instance/" in db_env:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{DATABASE_PATH.as_posix()}"
    else:
        # SQLAlchemy requires 'postgresql://' instead of legacy 'postgres://'
        if db_env.startswith("postgres://"):
            db_env = db_env.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = db_env
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Uploads Storage
    UPLOAD_FOLDER = BASE_DIR / "uploads"
    TENDERS_UPLOAD_FOLDER = UPLOAD_FOLDER / "tenders"
    DOCS_UPLOAD_FOLDER = UPLOAD_FOLDER / "documents"
    TENDERS_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    DOCS_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

    # AI Configurations (Optional / with deterministic fallback)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    USE_MOCK_AI = os.getenv("USE_MOCK_AI", "true").lower() in ("true", "1", "yes")

    # CORS Allowed Origins
    cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    CORS_ORIGINS = [orig.strip() for orig in cors_raw.split(",") if orig.strip()]
