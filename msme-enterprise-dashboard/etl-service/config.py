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
