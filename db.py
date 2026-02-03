# db.py
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Use DB_* vars if set (password with # or @ works; we encode it). Else use DATABASE_URL.
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

# echo=True during debugging; False for normal use
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
