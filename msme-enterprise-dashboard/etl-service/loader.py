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