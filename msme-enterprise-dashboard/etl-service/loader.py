from pymongo import MongoClient
from bson import ObjectId

from config import MONGO_URI, DATABASE_NAME


# ==========================================
# MongoDB Connection
# ==========================================

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


# ==========================================
# Collection Mapping
# ==========================================

COLLECTIONS = {

    "production": "productionrecords",

    "inventory": "inventoryrecords",

    "raw-materials": "rawmaterials",

    "finance": "financetransactions",

    "sales": "salesrecords"

}


# ==========================================
# Load Data
# ==========================================

def load_data(
    dataframe,
    department,
    upload_job_id=None
):

    print("\nConnecting to MongoDB...")

    if department not in COLLECTIONS:

        raise Exception(
            f"Invalid department: {department}"
        )

    collection_name = COLLECTIONS[department]

    collection = db[collection_name]

    # ==========================================
    # Check Data
    # ==========================================

    if dataframe.empty:

        print("No records found.")

        return 0

    # ==========================================
    # Convert DataFrame to records
    # ==========================================

    records = dataframe.to_dict(
        orient="records"
    )

    # ==========================================
    # Convert MongoDB IDs
    # ==========================================

    for record in records:

        # --------------------------------------
        # companyId
        # --------------------------------------

        if "companyId" in record:

            try:

                record["companyId"] = ObjectId(
                    str(record["companyId"])
                )

            except Exception:

                raise ValueError(
                    f"Invalid companyId: "
                    f"{record['companyId']}"
                )

        # --------------------------------------
        # uploadJobId
        # --------------------------------------

        if upload_job_id:

            try:

                record["uploadJobId"] = ObjectId(
                    str(upload_job_id)
                )

            except Exception:

                raise ValueError(
                    f"Invalid uploadJobId: "
                    f"{upload_job_id}"
                )

        else:

            record["uploadJobId"] = None

    # ==========================================
    # Convert NaN → None
    # ==========================================

    for record in records:

        for key, value in record.items():

            if pd_is_nan(value):

                record[key] = None

    # ==========================================
    # Bulk Insert
    # ==========================================

    result = collection.insert_many(
        records
    )

    inserted_count = len(
        result.inserted_ids
    )

    print(
        f"{inserted_count} records inserted "
        f"into {collection_name}"
    )

    return inserted_count


# ==========================================
# NaN Helper
# ==========================================

def pd_is_nan(value):

    try:

        return value != value

    except Exception:

        return False