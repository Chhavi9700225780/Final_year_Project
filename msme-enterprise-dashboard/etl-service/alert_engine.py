from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


def generate_alerts(department):

    print("\nChecking Alerts...")

    alerts = []

    if department == "inventory":

        collection = db["inventoryrecords"]

        for item in collection.find():

            if item.get("current_stock", 0) < item.get("minimum_stock", 0):

                alerts.append({
                    "type": "LOW_STOCK",
                    "message": f"{item.get('product_name')} stock is below minimum."
                })

    elif department == "production":

        collection = db["productionrecords"]

        for item in collection.find():

            planned = item.get("planned_quantity", 0)
            actual = item.get("actual_quantity", 0)

            if planned > 0:

                efficiency = (actual / planned) * 100

                if efficiency < 80:

                    alerts.append({
                        "type": "LOW_PRODUCTION",
                        "message": f"{item.get('product_name')} production efficiency is below 80%."
                    })

            defective = item.get("defective_quantity", 0)

            if actual > 0:

                defect_rate = (defective / actual) * 100

                if defect_rate > 10:

                    alerts.append({
                        "type": "HIGH_DEFECT",
                        "message": f"{item.get('product_name')} defect rate exceeded 10%."
                    })

    elif department == "finance":

        collection = db["financetransactions"]

        income = 0
        expense = 0

        for item in collection.find():

            if item.get("transaction_type", "").lower() == "income":
                income += item.get("amount", 0)

            elif item.get("transaction_type", "").lower() == "expense":
                expense += item.get("amount", 0)

        if expense > income:

            alerts.append({
                "type": "FINANCIAL_LOSS",
                "message": "Expenses exceed total income."
            })

    if not alerts:

        print("No Alerts Found")

    else:

        print(f"{len(alerts)} Alert(s) Generated\n")

        for alert in alerts:

            print(f"[{alert['type']}] {alert['message']}")