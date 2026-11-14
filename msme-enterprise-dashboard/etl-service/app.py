import hmac
import logging
import os
import tempfile
from pathlib import Path
from typing import Annotated
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, Depends
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from config import validate_settings, ETL_SERVICE_TOKEN, MAX_FILE_SIZE, ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from db import get_client
from pipeline import preview_dataset, start_pipeline

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("forge-etl")
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"

app = FastAPI(
    title="FORGE ETL API",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json"
)
DEPARTMENTS = {"production", "inventory", "raw-materials", "finance", "sales"}


@app.on_event("startup")
def startup():
    validate_settings()
    get_client().admin.command("ping")


def authenticate(x_etl_service_token: Annotated[str | None, Header()] = None):
    if not x_etl_service_token or not hmac.compare_digest(x_etl_service_token, ETL_SERVICE_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized ETL service request")


def validate_upload(file: UploadFile):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Only CSV and XLSX files are supported")
    content_type = (file.content_type or "").lower()
    allowed_types = {"text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream", "application/vnd.ms-excel"}
    if content_type and content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Unsupported content type")


async def save_upload(file: UploadFile):
    validate_upload(file)
    suffix = Path(file.filename or "dataset.csv").suffix.lower()
    fd, path = tempfile.mkstemp(prefix="forge-", suffix=suffix, dir=UPLOAD_FOLDER)
    size = 0
    try:
        with os.fdopen(fd, "wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail="File exceeds 20 MB limit")
                output.write(chunk)
        if size == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        return path
    except Exception:
        try: os.unlink(path)
        except OSError: pass
        raise


@app.get("/health")
def health():
    try:
        get_client().admin.command("ping")
        return {"status": "ok", "service": "forge-etl", "database": "connected"}
    except Exception:
        logger.exception("ETL health check failed")
        raise HTTPException(status_code=503, detail="ETL service unavailable")


@app.post("/v1/preview", dependencies=[Depends(authenticate)])
async def preview(file: UploadFile = File(...), department: str = Form(...)):
    if department not in DEPARTMENTS:
        raise HTTPException(status_code=422, detail="Invalid department")
    path = await save_upload(file)
    try:
        result = preview_dataset(path, department)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:
        logger.exception("Dataset preview failed")
        raise HTTPException(status_code=422, detail="Unable to preview this dataset")
    finally:
        try: os.unlink(path)
        except OSError: pass


@app.post("/v1/process", dependencies=[Depends(authenticate)])
async def process(file: UploadFile = File(...), department: str = Form(...), upload_job_id: str = Form(...), company_id: str = Form(...)):
    if department not in DEPARTMENTS:
        raise HTTPException(status_code=422, detail="Invalid department")
    from bson import ObjectId
    if not ObjectId.is_valid(upload_job_id) or not ObjectId.is_valid(company_id):
        raise HTTPException(status_code=422, detail="Invalid upload job or company identifier")
    path = await save_upload(file)
    try:
        result = start_pipeline(path, department, upload_job_id, company_id)
        return {"success": True, **result}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except PyMongoError:
        logger.exception("ETL database operation failed")
        raise HTTPException(status_code=503, detail="Database operation failed; retry using the same upload job")
    except Exception:
        logger.exception("ETL processing failed")
        raise HTTPException(status_code=500, detail="Dataset processing failed")
    finally:
        try: os.unlink(path)
        except OSError: pass


"""

import sys
import json

try:

    sys.stdout.reconfigure(
        encoding="utf-8"
    )

    sys.stderr.reconfigure(
        encoding="utf-8"
    )

except Exception:

    pass


from extractor import extract_data
from validator import validate_data
from transformer import transform_data
from loader import load_data
from analytics import generate_kpis
from alert_engine import generate_alerts
from utils import dataframe_summary
from schema_detector import detect_mapping


# ============================================================
# NORMAL ETL PIPELINE
# ============================================================

def start_pipeline(
    file_path,
    department,
    upload_job_id,
    company_id
):

    print("=" * 60)
    print("Enterprise ETL Pipeline Started")
    print("=" * 60)

    print(
        f"File       : {file_path}"
    )

    print(
        f"Department : {department}"
    )

    print(
        f"Company ID : {company_id}"
    )

    print(
        f"Upload Job : {upload_job_id}"
    )

    # ========================================================
    # 1. EXTRACT
    # ========================================================

    dataframe = extract_data(
        file_path
    )

    print(
        "\nExtraction Completed"
    )

    print(
        dataframe_summary(
            dataframe
        )
    )

    # ========================================================
    # 2. VALIDATE + AUTO MAP
    # ========================================================

    dataframe = validate_data(
        dataframe,
        department
    )

    print(
        "\nValidation Completed"
    )

    # ========================================================
    # 3. TRANSFORM
    # ========================================================

    dataframe = transform_data(
        dataframe,
        department
    )

    print(
        "\nTransformation Completed"
    )

    # ========================================================
    # 4. LOAD
    # ========================================================

    inserted = load_data(

        dataframe,

        department,

        upload_job_id,

        company_id
    )

    print(
        f"\n{inserted} records "
        f"inserted into MongoDB."
    )

    # ========================================================
    # 5. ANALYTICS
    # ========================================================

    generate_kpis(
        department,
        company_id
    )

    print(
        "\nKPI Generation Completed"
    )

    # ========================================================
    # 6. ALERTS
    # ========================================================

    alerts = generate_alerts(
        department,
        company_id
    )

    print(
        "\nAlert Generation Completed"
    )

    # ========================================================
    # COMPLETE
    # ========================================================

    print(
        "\n" + "=" * 60
    )

    print(
        "Pipeline Finished Successfully"
    )

    print(
        "=" * 60
    )

    return {

        "recordCount":
            inserted,

        "alerts":
            alerts,

    }


# ============================================================
# DATASET PREVIEW
# ============================================================

def preview_dataset(
    file_path,
    department
):

    print(
        "\n" + "=" * 60
    )

    print(
        "DATASET SCHEMA DETECTION"
    )

    print(
        "=" * 60
    )

    print(
        f"File       : {file_path}"
    )

    print(
        f"Department : {department}"
    )

    # ========================================================
    # EXTRACT
    # ========================================================

    dataframe = extract_data(
        file_path
    )

    columns = list(
        dataframe.columns
    )

    # ========================================================
    # DETECT MAPPING
    # ========================================================

    mapping = detect_mapping(
        columns,
        department
    )

    result = {

        "success":
            True,

        "department":
            department,

        "columns":
            columns,

        "mapping":
            mapping,

    }

    print(
        "\nSchema detection completed."
    )

    # ========================================================
    # JSON RESULT
    # ========================================================

    print(
        "SCHEMA_RESULT:"
        + json.dumps(
            result,
            ensure_ascii=False
        )
    )


# ============================================================
# MAIN
# ============================================================

def main():

    allowed_departments = [

        "production",
        "inventory",
        "raw-materials",
        "finance",
        "sales",

    ]

    # ========================================================
    # PREVIEW MODE
    # ========================================================

    if (
        len(sys.argv) >= 2
        and sys.argv[1] == "preview"
    ):

        if len(sys.argv) != 4:

            print(
                "Usage: python app.py "
                "preview <file_path> "
                "<department>"
            )

            sys.exit(1)

        file_path = sys.argv[2]

        department = sys.argv[3]

        if department not in allowed_departments:

            print(
                f"Invalid department: "
                f"{department}"
            )

            sys.exit(1)

        try:

            preview_dataset(
                file_path,
                department
            )

            sys.exit(0)

        except Exception as error:

            print(
                f"Schema detection failed: "
                f"{error}"
            )

            sys.exit(1)

    # ========================================================
    # NORMAL ETL MODE
    # ========================================================

    if len(sys.argv) != 5:

        print(
            "Usage: python app.py "
            "<file_path> <department> "
            "<upload_job_id> <company_id>"
        )

        sys.exit(1)

    file_path = sys.argv[1]

    department = sys.argv[2]

    upload_job_id = sys.argv[3]

    company_id = sys.argv[4]

    # ========================================================
    # VALIDATE DEPARTMENT
    # ========================================================

    if department not in allowed_departments:

        print(
            f"Invalid department: "
            f"{department}"
        )

        sys.exit(1)

    # ========================================================
    # RUN PIPELINE
    # ========================================================

    try:

        start_pipeline(

            file_path,

            department,

            upload_job_id,

            company_id

        )

    except Exception as error:

        print(
            f"ETL Pipeline Failed: "
            f"{error}"
        )

        sys.exit(1)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()

"""