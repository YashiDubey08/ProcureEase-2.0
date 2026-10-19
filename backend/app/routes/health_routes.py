from flask import Blueprint, jsonify
import pymupdf
from app.config import Config
from app.database import engine

health_bp = Blueprint("health", __name__, url_prefix="/api")

@health_bp.route("/health", methods=["GET"])
def health_check():
    # Verify SQLite DB connectivity
    db_connected = False
    try:
        with engine.connect() as conn:
            db_connected = True
    except Exception as e:
        db_connected = False

    return jsonify({
        "status": "healthy",
        "project": Config.PROJECT_NAME,
        "tagline": "Don't just find tenders. Know if you can bid—and exactly what to do next.",
        "concept": "Tender-to-Action Intelligence",
        "philosophy": "AI understands. Rules decide.",
        "database": {
            "type": "SQLite",
            "connected": db_connected,
            "path": str(Config.DATABASE_PATH)
        },
        "pdf_engine": {
            "name": "PyMuPDF",
            "version": pymupdf.__version__
        },
        "ai_engine": {
            "mode": "Mock/Deterministic Fallback" if Config.USE_MOCK_AI else "Live LLM API"
        }
    }), 200
