from bson import ObjectId
from datetime import datetime, timezone
import math
import numpy as np
import pandas as pd
from pymongo.errors import DuplicateKeyError
from db import get_db

COLLECTIONS = {
    "production": "productionrecords", "inventory": "inventoryrecords",
    "raw-materials": "rawmaterials", "finance": "financetransactions", "sales": "salesrecords",
}
BATCH_SIZE = 500


def _clean_value(value):
    if value is None or value is pd.NaT:
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.to_pydatetime() if isinstance(value, pd.Timestamp) else value
    if isinstance(value, np.generic):
        value = value.item()
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    if pd.isna(value) if not isinstance(value, (dict, list, tuple)) else False:
        return None
    return value


def load_data(dataframe, department, upload_job_id, company_id):
    if department not in COLLECTIONS:
        raise ValueError("Invalid department")
    if not ObjectId.is_valid(str(company_id)) or not ObjectId.is_valid(str(upload_job_id)):
        raise ValueError("Invalid company_id or upload_job_id")
    company_oid, job_oid = ObjectId(str(company_id)), ObjectId(str(upload_job_id))
    if dataframe.empty:
        return 0
    db = get_db()
    ledger = db["etl_idempotency"]
    collection = db[COLLECTIONS[department]]
    existing_job = ledger.find_one({"_id": job_oid})
    if existing_job:
        if existing_job.get("companyId") != company_oid or existing_job.get("department") != department:
            raise ValueError("Upload job does not match the supplied company and department")
        if existing_job.get("status") == "completed":
            # A previous request committed its data but may have timed out before
            # returning to Node. Return the committed count and continue analytics.
            return int(existing_job.get("recordCount", 0))
        raise ValueError("This upload job is already being processed")

    session = get_db().client.start_session()
    try:
        with session:
            with session.start_transaction():
                ledger.insert_one({"_id": job_oid, "companyId": company_oid, "department": department, "status": "processing", "createdAt": datetime.now(timezone.utc)}, session=session)
                batch = []
                inserted = 0
                for row in dataframe.to_dict(orient="records"):
                    clean = {}
                    for key, value in row.items():
                        if key.lower() in {"companyid", "company_id", "company", "uploadjobid", "upload_job_id"}:
                            continue
                        clean[key] = _clean_value(value)
                    clean["companyId"] = company_oid
                    clean["uploadJobId"] = job_oid
                    batch.append(clean)
                    if len(batch) >= BATCH_SIZE:
                        collection.insert_many(batch, ordered=True, session=session)
                        inserted += len(batch)
                        batch.clear()
                if batch:
                    collection.insert_many(batch, ordered=True, session=session)
                    inserted += len(batch)
                ledger.update_one({"_id": job_oid}, {"$set": {"status": "completed", "recordCount": inserted, "completedAt": datetime.now(timezone.utc)}}, session=session)
                return inserted
    except DuplicateKeyError as exc:
        committed = ledger.find_one({"_id": job_oid, "companyId": company_oid, "department": department, "status": "completed"})
        if committed:
            return int(committed.get("recordCount", 0))
        raise ValueError("This upload job is already being processed") from exc
    finally:
        session.end_session()

"""
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

import pandas as pd
import numpy as np

from config import (
    MONGO_URI,
    DATABASE_NAME
)


# ==========================================
# MongoDB Connection
# ==========================================

client = MongoClient(
    MONGO_URI
)

db = client[
    DATABASE_NAME
]


# ==========================================
# Collection Mapping
# ==========================================

COLLECTIONS = {

    "production":
        "productionrecords",

    "inventory":
        "inventoryrecords",

    "raw-materials":
        "rawmaterials",

    "finance":
        "financetransactions",

    "sales":
        "salesrecords",

}


# ==========================================
# LOAD DATA
# ==========================================

def load_data(
    dataframe,
    department,
    upload_job_id=None,
    company_id=None
):

    print(
        "\nConnecting to MongoDB..."
    )


    # ==========================================
    # VALIDATE DEPARTMENT
    # ==========================================

    if department not in COLLECTIONS:

        raise ValueError(
            f"Invalid department: {department}"
        )


    # ==========================================
    # VALIDATE COMPANY
    # ==========================================

    if not company_id:

        raise ValueError(
            "company_id is required."
        )


    # ==========================================
    # COLLECTION
    # ==========================================

    collection_name = (
        COLLECTIONS[department]
    )

    collection = db[
        collection_name
    ]


    # ==========================================
    # CHECK DATA
    # ==========================================

    if dataframe.empty:

        print(
            "No records found."
        )

        return 0


    # ==========================================
    # CONVERT DATAFRAME
    # ==========================================

    records = dataframe.to_dict(
        orient="records"
    )


    # ==========================================
    # CONVERT COMPANY ID
    # ==========================================

    try:

        company_object_id = ObjectId(
            str(company_id)
        )

    except Exception:

        raise ValueError(
            f"Invalid company_id: {company_id}"
        )


    # ==========================================
    # CONVERT UPLOAD JOB ID
    # ==========================================

    upload_object_id = None

    if upload_job_id:

        try:

            upload_object_id = ObjectId(
                str(upload_job_id)
            )

        except Exception:

            raise ValueError(
                "Invalid upload_job_id: "
                f"{upload_job_id}"
            )


    # ==========================================
    # PREPARE RECORDS
    # ==========================================

    cleaned_records = []


    for record in records:

        cleaned_record = {}


        for key, value in record.items():

            # ----------------------------------
            # NEVER TRUST COMPANY ID FROM CSV
            # ----------------------------------

            if key in [
                "companyId",
                "company_id",
                "company",
            ]:

                continue


            # ----------------------------------
            # Convert pandas NaN / NaT
            # ----------------------------------

            if pd.isna(value):

                cleaned_record[key] = None

                continue


            # ----------------------------------
            # Pandas Timestamp
            # ----------------------------------

            if isinstance(
                value,
                pd.Timestamp
            ):

                cleaned_record[key] = (
                    value.to_pydatetime()
                )

                continue


            # ----------------------------------
            # Numpy values
            # ----------------------------------

            if isinstance(
                value,
                np.generic
            ):

                cleaned_record[key] = (
                    value.item()
                )

                continue


            # ----------------------------------
            # Normal value
            # ----------------------------------

            cleaned_record[key] = value


        # ======================================
        # TENANT INFORMATION
        # ======================================

        cleaned_record[
            "companyId"
        ] = company_object_id


        cleaned_record[
            "uploadJobId"
        ] = upload_object_id


        cleaned_records.append(
            cleaned_record
        )


    # ==========================================
    # DEBUG — SHOW FINAL SCHEMA
    # ==========================================

    print(
        "\nFinal MongoDB fields:"
    )

    if cleaned_records:

        print(
            list(
                cleaned_records[0].keys()
            )
        )


    # ==========================================
    # BULK INSERT
    # ==========================================

    result = collection.insert_many(
        cleaned_records
    )


    inserted_count = len(
        result.inserted_ids
    )


    print(
        f"{inserted_count} records inserted "
        f"into {collection_name}"
    )


    return inserted_count

"""