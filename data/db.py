# data/db.py
import os
from pathlib import Path
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load .env from project root so uvicorn/Docker use the same credentials
_project_root = Path(__file__).resolve().parent.parent
load_dotenv(_project_root / ".env")

if all(os.getenv(k) for k in ("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")):
    user = os.getenv("DB_USER")
    password = quote_plus(os.getenv("DB_PASSWORD", ""))
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "6543")
    name = os.getenv("DB_NAME")
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{name}"
else:
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "Set DATABASE_URL in .env, or set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (optional: DB_PORT)."
    )

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
