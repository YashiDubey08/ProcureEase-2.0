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
    # Safe SQLite table migration checks before create_all
    try:
        with engine.connect() as conn:
            # Check roadmap_steps
            res_steps = conn.exec_driver_sql("PRAGMA table_info(roadmap_steps)").fetchall()
            step_cols = [row[1] for row in res_steps]
            if step_cols and "user_id" not in step_cols:
                conn.exec_driver_sql("DROP TABLE roadmap_steps")
                conn.commit()

            # Check application_records
            res_apps = conn.exec_driver_sql("PRAGMA table_info(application_records)").fetchall()
            app_cols = [row[1] for row in res_apps]
            if app_cols and "user_id" not in app_cols:
                conn.exec_driver_sql("DROP TABLE application_records")
                conn.commit()
    except Exception as e:
        print("Note on table schema reset check:", e)

    # Import all models before calling create_all
    import app.models
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    # Safe SQLite column migration for startups and documents
    try:
        with engine.connect() as conn:
            res_st = conn.exec_driver_sql("PRAGMA table_info(startups)").fetchall()
            st_cols = [row[1] for row in res_st]
            if "user_id" not in st_cols:
                conn.exec_driver_sql("ALTER TABLE startups ADD COLUMN user_id VARCHAR(36)")

            res_doc = conn.exec_driver_sql("PRAGMA table_info(documents)").fetchall()
            doc_cols = [row[1] for row in res_doc]
            if "user_id" not in doc_cols:
                conn.exec_driver_sql("ALTER TABLE documents ADD COLUMN user_id VARCHAR(36)")
            conn.commit()
    except Exception as e:
        print("Note on column schema check:", e)
