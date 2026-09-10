import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


from pymongo import MongoClient
from bson import ObjectId

from config import MONGO_URI, DATABASE_NAME


# ==========================================
# MongoDB Connection
# ==========================================

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


# ==========================================
# Generate KPIs
# ==========================================

def generate_kpis(department, company_id):

    print("\nGenerating KPIs...")

    # ==========================================
    # Validate Company ID
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
    # Production
    # ==========================================

    if department == "production":

        collection = db["productionrecords"]

        data = list(
            collection.find({
                "companyId": company_object_id
            })
        )

        if not data:

            print("No production data found.")

            return

        planned = sum(
            item.get("plannedQuantity", 0) or 0
            for item in data
        )

        actual = sum(
            item.get("actualQuantity", 0) or 0
            for item in data
        )

        defective = sum(
            item.get("defectiveQuantity", 0) or 0
            for item in data
        )

        efficiency = (
            actual / planned * 100
            if planned
            else 0
        )

        defect_rate = (
            defective / actual * 100
            if actual
            else 0
        )

        print(
            f"Planned Production : {planned}"
        )

        print(
            f"Actual Production : {actual}"
        )

        print(
            f"Efficiency : {efficiency:.2f}%"
        )

        print(
            f"Defect Rate : {defect_rate:.2f}%"
        )


    # ==========================================
    # Inventory
    # ==========================================

    elif department == "inventory":

        collection = db["inventoryrecords"]

        data = list(
            collection.find({
                "companyId": company_object_id
            })
        )

        total_stock = sum(
            item.get("closingStock", 0) or 0
            for item in data
        )

        print(
            f"Total Current Stock : {total_stock}"
        )


    # ==========================================
    # Sales
    # ==========================================

    elif department == "sales":

        collection = db["salesrecords"]

        data = list(
            collection.find({
                "companyId": company_object_id
            })
        )

        revenue = sum(
            item.get("revenue", 0) or 0
            for item in data
        )

        quantity = sum(
            item.get("quantity", 0) or 0
            for item in data
        )

        print(
            f"Total Revenue : INR {revenue}"
        )

        print(
            f"Items Sold : {quantity}"
        )


    # ==========================================
    # Finance
    # ==========================================

    elif department == "finance":

        collection = db["financetransactions"]

        data = list(
            collection.find({
                "companyId": company_object_id
            })
        )

        revenue = sum(
            item.get("amount", 0) or 0
            for item in data
            if item.get(
                "transactionType",
                ""
            ).lower() == "revenue"
        )

        expense = sum(
            item.get("amount", 0) or 0
            for item in data
            if item.get(
                "transactionType",
                ""
            ).lower() == "expense"
        )

        profit = revenue - expense

        print(
            f"Revenue : INR {revenue}"
        )

        print(
            f"Expense : INR {expense}"
        )

        print(
            f"Profit : INR {profit}"
        )


    # ==========================================
    # Raw Materials
    # ==========================================

    elif department == "raw-materials":

        collection = db["rawmaterials"]

        data = list(
            collection.find({
                "companyId": company_object_id
            })
        )

        total_material = sum(
            item.get("currentStock", 0) or 0
            for item in data
        )

        print(
            f"Raw Material Available : "
            f"{total_material}"
        )


    # ==========================================
    # Invalid Department
    # ==========================================

    else:

        print("Invalid Department")