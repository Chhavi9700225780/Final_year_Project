import pandas as pd


def transform_data(df):

    print("\nStarting Data Transformation...")

    # ==========================================
    # Standardize column names
    # ==========================================

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # ==========================================
    # Convert snake_case → camelCase
    # ==========================================

    column_mapping = {

        # Common
        "company_id": "companyId",
        "upload_job_id": "uploadJobId",

        # Production
        "product_id": "productId",
        "product_name": "productName",
        "planned_quantity": "plannedQuantity",
        "actual_quantity": "actualQuantity",
        "defective_quantity": "defectiveQuantity",
        "production_cost": "productionCost",
        "production_date": "productionDate",

        # Inventory
        "opening_stock": "openingStock",
        "produced_quantity": "producedQuantity",
        "sold_quantity": "soldQuantity",
        "closing_stock": "closingStock",
        "record_date": "recordDate",

        # Raw Material
        "material_id": "materialId",
        "material_name": "materialName",
        "current_stock": "currentStock",
        "minimum_stock": "minimumStock",
        "unit_cost": "unitCost",
        "last_updated": "lastUpdated",

        # Finance
        "transaction_type": "transactionType",
        "transaction_date": "transactionDate",

        # Sales
        "customer_region": "customerRegion",
        "sale_date": "saleDate",
    }

    df = df.rename(columns=column_mapping)

    # ==========================================
    # Date Columns
    # ==========================================

    date_columns = [
        "productionDate",
        "recordDate",
        "lastUpdated",
        "transactionDate",
        "saleDate",
    ]

    for column in date_columns:

        if column in df.columns:

            df[column] = pd.to_datetime(
                df[column],
                errors="coerce"
            )

    # ==========================================
    # Numeric Columns
    # ==========================================

    numeric_columns = [
        "plannedQuantity",
        "actualQuantity",
        "defectiveQuantity",
        "productionCost",

        "openingStock",
        "producedQuantity",
        "soldQuantity",
        "closingStock",

        "currentStock",
        "minimumStock",
        "unitCost",

        "amount",

        "quantity",
        "revenue",
    ]

    for column in numeric_columns:

        if column in df.columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

            df[column] = df[column].fillna(0)

            # No negative values
            df[column] = df[column].clip(lower=0)

    # ==========================================
    # Remove duplicates
    # ==========================================

    df = df.drop_duplicates()

    # ==========================================
    # Reset index
    # ==========================================

    df = df.reset_index(drop=True)

    print("Transformation Completed Successfully")

    print(f"Final Rows : {len(df)}")

    print("Final Columns:")
    print(list(df.columns))

    return df