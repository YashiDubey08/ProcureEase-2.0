import os
import re
from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import init_db, db_session

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS with credentials support for frontend Vite dev server and Vercel production
    allowed_origins = list(getattr(config_class, "CORS_ORIGINS", []))
    default_patterns = [
        re.compile(r"^https:\/\/.*\.vercel\.app$"),
        re.compile(r"^http:\/\/localhost(:\d+)?$"),
        re.compile(r"^http:\/\/127\.0\.0\.1(:\d+)?$")
    ]
    for pattern in default_patterns:
        allowed_origins.append(pattern)

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-User-Id"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Security Response Headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # Initialize SQLite database and tables
    with app.app_context():
        init_db()

    # Tear down database session after each request
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.health_routes import health_bp
    from app.routes.startup_routes import startup_bp
    from app.routes.document_routes import document_bp
    from app.routes.tender_routes import tender_bp
    from app.routes.analysis_routes import analysis_bp
    from app.routes.demo_routes import demo_bp
    from app.routes.journey_routes import journey_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(startup_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(tender_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(demo_bp)
    app.register_blueprint(journey_bp)

    return app
