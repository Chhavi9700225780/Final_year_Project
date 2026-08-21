import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


def generate_kpis(department):

    print("\nGenerating KPIs...")

    if department == "production":

        collection = db["productionrecords"]

        data = list(collection.find())

        if not data:
            print("No production data found.")
            return

        planned = sum(item.get("planned_quantity", 0) for item in data)
        actual = sum(item.get("actual_quantity", 0) for item in data)
        defective = sum(item.get("defective_quantity", 0) for item in data)

        efficiency = (actual / planned * 100) if planned else 0
        defect_rate = (defective / actual * 100) if actual else 0

        print(f"Planned Production : {planned}")
        print(f"Actual Production : {actual}")
        print(f"Efficiency : {efficiency:.2f}%")
        print(f"Defect Rate : {defect_rate:.2f}%")

    elif department == "inventory":

        collection = db["inventoryrecords"]

        data = list(collection.find())

        total_stock = sum(item.get("current_stock", 0) for item in data)

        print(f"Total Current Stock : {total_stock}")

    elif department == "sales":

        collection = db["salesrecords"]

        data = list(collection.find())

        revenue = sum(item.get("revenue", 0) for item in data)

        quantity = sum(item.get("quantity", 0) for item in data)

        print(f"Total Revenue : ₹{revenue}")
        print(f"Items Sold : {quantity}")

    elif department == "finance":

        collection = db["financetransactions"]

        data = list(collection.find())

        income = sum(
            item.get("amount", 0)
            for item in data
            if item.get("transaction_type", "").lower() == "income"
        )

        expense = sum(
            item.get("amount", 0)
            for item in data
            if item.get("transaction_type", "").lower() == "expense"
        )

        print(f"Income : INR{income}")
        print(f"Expense : INR{expense}")
        print(f"Profit : INR{income-expense}")

    elif department == "raw-materials":

        collection = db["rawmaterials"]

        data = list(collection.find())

        total_material = sum(item.get("current_stock", 0) for item in data)

        print(f"Raw Material Available : {total_material}")

    else:

        print("Invalid Department")