import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "").strip()
DATABASE_NAME = os.getenv("DATABASE_NAME", "msme_dashboard").strip()
ETL_SERVICE_TOKEN = os.getenv("ETL_SERVICE_TOKEN", "").strip()
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(20 * 1024 * 1024)))
MAX_ROWS = int(os.getenv("MAX_ROWS", "100000"))
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp/forge-etl-uploads")
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}


def validate_settings():
    if not MONGO_URI:
        raise RuntimeError("MONGO_URI is required")
    if not DATABASE_NAME:
        raise RuntimeError("DATABASE_NAME is required")
    if len(ETL_SERVICE_TOKEN) < 32:
        raise RuntimeError("ETL_SERVICE_TOKEN must contain at least 32 characters")
    if MAX_FILE_SIZE < 1024 or MAX_FILE_SIZE > 100 * 1024 * 1024:
        raise RuntimeError("MAX_FILE_SIZE must be between 1 KB and 100 MB")
    Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

""" 
import os
from dotenv import load_dotenv

load_dotenv()

# ===============================
# MongoDB Configuration
# ===============================

MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = "msme_dashboard"

# ===============================
# AWS Configuration
# ===============================

#AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")

#AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

#AWS_REGION = os.getenv("AWS_REGION")

#AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# ===============================
# Upload Folder
# ===============================

UPLOAD_FOLDER = "uploads"

ALLOWED_EXTENSIONS = [
    ".csv",
    ".xlsx"
]

# ===============================
# ETL Settings
# ===============================

MAX_FILE_SIZE = 20 * 1024 * 1024

DEFAULT_ENCODING = "utf-8"

DATE_FORMAT = "%Y-%m-%d"
"""