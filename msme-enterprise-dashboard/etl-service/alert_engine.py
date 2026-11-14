"""
from pymongo import MongoClient
from bson import ObjectId

from config import (
    MONGO_URI,
    DATABASE_NAME
)


# ============================================================
# MONGODB CONNECTION
# ============================================================

client = MongoClient(
    MONGO_URI
)

db = client[
    DATABASE_NAME
]


# ============================================================
# GENERATE ALERTS
# ============================================================

def generate_alerts(
    department,
    company_id
):

    print(
        "\nChecking Alerts..."
    )

    alerts = []

    # ========================================================
    # VALIDATE COMPANY ID
    # ========================================================

    try:

        company_object_id = ObjectId(
            str(company_id)
        )

    except Exception:

        raise ValueError(
            f"Invalid company_id: "
            f"{company_id}"
        )

    # ========================================================
    # INVENTORY ALERTS
    # ========================================================

    if department == "inventory":

        collection = db[
            "inventoryrecords"
        ]

        records = collection.find({
            "companyId":
                company_object_id
        })

        for item in records:

            current_stock = (
                item.get(
                    "closingStock",
                    0
                )
                or 0
            )

            minimum_stock = (
                item.get(
                    "minimumStock",
                    0
                )
                or 0
            )

            if current_stock < minimum_stock:

                item_name = (
                    item.get(
                        "itemName",
                        "Unknown item"
                    )
                )

                alerts.append({

                    "type":
                        "LOW_STOCK",

                    "message":
                        (
                            f"{item_name} "
                            f"stock is below minimum."
                        ),
                })

    # ========================================================
    # RAW MATERIAL ALERTS
    # ========================================================

    elif department == "raw-materials":

        collection = db[
            "rawmaterials"
        ]

        records = collection.find({
            "companyId":
                company_object_id
        })

        for item in records:

            current_stock = (
                item.get(
                    "currentStock",
                    0
                )
                or 0
            )

            minimum_stock = (
                item.get(
                    "minimumStock",
                    0
                )
                or 0
            )

            if current_stock < minimum_stock:

                material_name = (
                    item.get(
                        "materialName",
                        "Unknown material"
                    )
                )

                alerts.append({

                    "type":
                        "LOW_RAW_MATERIAL",

                    "message":
                        (
                            f"{material_name} "
                            f"raw material stock "
                            f"is below minimum."
                        ),
                })

    # ========================================================
    # PRODUCTION ALERTS
    # ========================================================

    elif department == "production":

        collection = db[
            "productionrecords"
        ]

        records = collection.find({
            "companyId":
                company_object_id
        })

        for item in records:

            product_name = (
                item.get(
                    "productName",
                    "Unknown product"
                )
            )

            planned = (
                item.get(
                    "plannedQuantity",
                    0
                )
                or 0
            )

            actual = (
                item.get(
                    "actualQuantity",
                    0
                )
                or 0
            )

            # ------------------------------------------------
            # Production Efficiency
            # ------------------------------------------------

            if planned > 0:

                efficiency = (
                    actual / planned
                ) * 100

                if efficiency < 80:

                    alerts.append({

                        "type":
                            "LOW_PRODUCTION",

                        "message":
                            (
                                f"{product_name} "
                                f"production efficiency "
                                f"is below 80%."
                            ),
                    })

            # ------------------------------------------------
            # Defect Rate
            # ------------------------------------------------

            defective = (
                item.get(
                    "defectiveQuantity",
                    0
                )
                or 0
            )

            if actual > 0:

                defect_rate = (
                    defective / actual
                ) * 100

                if defect_rate > 10:

                    alerts.append({

                        "type":
                            "HIGH_DEFECT",

                        "message":
                            (
                                f"{product_name} "
                                f"defect rate "
                                f"exceeded 10%."
                            ),
                    })

    # ========================================================
    # FINANCE ALERTS
    # ========================================================

    elif department == "finance":

        collection = db[
            "financetransactions"
        ]

        records = collection.find({
            "companyId":
                company_object_id
        })

        revenue = 0
        expense = 0

        for item in records:

            transaction_type = (
                str(
                    item.get(
                        "transactionType",
                        ""
                    )
                )
                .strip()
                .lower()
            )

            amount = (
                item.get(
                    "amount",
                    0
                )
                or 0
            )

            if transaction_type == "revenue":

                revenue += amount

            elif transaction_type == "expense":

                expense += amount

        if expense > revenue:

            alerts.append({

                "type":
                    "FINANCIAL_LOSS",

                "message":
                    (
                        "Expenses exceed "
                        "total revenue."
                    ),
            })

    # ========================================================
    # RESULT
    # ========================================================

    if not alerts:

        print(
            "No Alerts Found"
        )

    else:

        print(
            f"{len(alerts)} "
            f"Alert(s) Generated\n"
        )

        for alert in alerts:

            print(
                f"[{alert['type']}] "
                f"{alert['message']}"
            )

    return alerts
"""

import hashlib
from bson import ObjectId
from db import get_db
from loader import COLLECTIONS

ALERT_TYPES = {
    "LOW_STOCK": ("low_stock", "high"),
    "LOW_RAW_MATERIAL": ("low_stock", "high"),
    "LOW_PRODUCTION": ("production_shortfall", "medium"),
    "HIGH_DEFECT": ("high_defect_rate", "high"),
    "FINANCIAL_LOSS": ("financial", "high"),
}


def generate_alerts(department, company_id):
    if department not in COLLECTIONS or not ObjectId.is_valid(str(company_id)):
        raise ValueError("Invalid department or company_id")
    db = get_db()
    company_oid = ObjectId(str(company_id))
    collection = db[COLLECTIONS[department]]
    records = collection.find({"companyId": company_oid}, no_cursor_timeout=False).batch_size(500)
    alerts = []
    try:
        if department in ("inventory", "raw-materials"):
            stock_field = "closingStock" if department == "inventory" else "currentStock"
            name_field = "productName" if department == "inventory" else "materialName"
            for item in records:
                current, minimum = item.get(stock_field) or 0, item.get("minimumStock") or 0
                if current < minimum:
                    name = str(item.get(name_field) or "Unknown item")[:120]
                    alerts.append(("LOW_STOCK" if department == "inventory" else "LOW_RAW_MATERIAL", f"{name} stock is below minimum."))
        elif department == "production":
            for item in records:
                name = str(item.get("productName") or "Unknown product")[:120]
                planned, actual = item.get("plannedQuantity") or 0, item.get("actualQuantity") or 0
                defective = item.get("defectiveQuantity") or 0
                if planned > 0 and actual / planned * 100 < 80:
                    alerts.append(("LOW_PRODUCTION", f"{name} production efficiency is below 80%.") )
                if actual > 0 and defective / actual * 100 > 10:
                    alerts.append(("HIGH_DEFECT", f"{name} defect rate exceeded 10%."))
        elif department == "finance":
            revenue = expense = 0
            for item in records:
                amount = item.get("amount") or 0
                kind = str(item.get("transactionType") or "").lower()
                if kind == "revenue": revenue += amount
                elif kind == "expense": expense += amount
            if expense > revenue:
                alerts.append(("FINANCIAL_LOSS", "Expenses exceed total revenue."))
    finally:
        records.close()
    created = []
    for alert_code, message in alerts:
        alert_type, severity = ALERT_TYPES[alert_code]
        fingerprint = hashlib.sha256(f"{company_oid}:{department}:{alert_code}:{message}".encode()).hexdigest()
        db["alerts"].update_one(
            {"companyId": company_oid, "fingerprint": fingerprint, "isResolved": False},
            {"$setOnInsert": {"companyId": company_oid, "fingerprint": fingerprint, "type": alert_type, "severity": severity, "title": alert_code.replace("_", " ").title(), "message": message, "sourceDepartment": department, "isResolved": False}},
            upsert=True,
        )
        created.append({"type": alert_code, "message": message, "severity": severity})
    return created
