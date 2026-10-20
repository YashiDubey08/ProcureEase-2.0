from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from app.config import Config

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    connect_args={"check_same_thread": False} if "sqlite" in Config.SQLALCHEMY_DATABASE_URI else {}
)

db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # Import all models before calling create_all
    import app.models
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    # Safe SQLite column migration without dropping tables or losing user data
    try:
        with engine.connect() as conn:
            # 1. Check users table
            res_u = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
            u_cols = [row[1] for row in res_u]
            if "email_verified" not in u_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0")
            if "email_verification_token" not in u_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(100)")
            if "reset_password_token" not in u_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(100)")
            if "reset_password_expires_at" not in u_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN reset_password_expires_at DATETIME")

            # 2. Check startups table
            res_st = conn.exec_driver_sql("PRAGMA table_info(startups)").fetchall()
            st_cols = [row[1] for row in res_st]
            if "user_id" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN user_id VARCHAR(36)")
            if "business_domain" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN business_domain VARCHAR(100) DEFAULT 'Technology'")
            if "state_location" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN state_location VARCHAR(100) DEFAULT ''")
            if "business_structure" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN business_structure VARCHAR(100) DEFAULT 'Private Limited Company'")
            if "has_employees" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN has_employees BOOLEAN DEFAULT 0")
            if "has_physical_premises" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN has_physical_premises BOOLEAN DEFAULT 0")
            if "is_interstate_or_ecommerce" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN is_interstate_or_ecommerce BOOLEAN DEFAULT 0")
            if "creates_ip" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN creates_ip BOOLEAN DEFAULT 1")

            # 3. Check documents table
            res_doc = conn.exec_driver_sql("PRAGMA table_info(documents)").fetchall()
            doc_cols = [row[1] for row in res_doc]
            if "user_id" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN user_id VARCHAR(36)")
            if "step_key" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN step_key VARCHAR(50)")
            if "preparation_status" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN preparation_status VARCHAR(50) DEFAULT 'UPLOADED'")
            if "is_required" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN is_required BOOLEAN DEFAULT 1")
            if "mime_type" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN mime_type VARCHAR(100)")

            # 4. Check roadmap_steps table
            res_steps = conn.exec_driver_sql("PRAGMA table_info(roadmap_steps)").fetchall()
            step_cols = [row[1] for row in res_steps]
            if "why_necessary" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN why_necessary TEXT DEFAULT ''")
            if "applicability" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN applicability TEXT DEFAULT ''")
            if "required_documents_json" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN required_documents_json TEXT DEFAULT '[]'")
            if "verification_source" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN verification_source VARCHAR(255) DEFAULT ''")
            if "last_verified_date" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN last_verified_date VARCHAR(100) DEFAULT 'October 2026'")
            if "submission_date" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN submission_date VARCHAR(100) DEFAULT ''")
            if "reference_number" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN reference_number VARCHAR(255) DEFAULT ''")
            if "estimated_duration" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN estimated_duration VARCHAR(100) DEFAULT ''")
            if "prerequisites_json" not in step_cols:
                conn.exec_driver_sql("ALTER TABLE roadmap_steps ADD COLUMN prerequisites_json TEXT DEFAULT '[]'")

            conn.commit()
    except Exception as e:
        print("Note on column schema migration:", e)
