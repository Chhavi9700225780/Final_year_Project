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