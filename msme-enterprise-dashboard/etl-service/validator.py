import pandas as pd


REQUIRED_COLUMNS = {

    "production": [
        "company_id",
        "product_id",
        "product_name",
        "planned_quantity",
        "actual_quantity",
        "production_date",
    ],

    "inventory": [
        "company_id",
        "product_id",
        "product_name",
        "opening_stock",
        "closing_stock",
        "record_date",
    ],

    "raw-materials": [
        "company_id",
        "material_id",
        "material_name",
        "supplier",
        "current_stock",
        "minimum_stock",
        "unit_cost",
    ],

    "finance": [
        "company_id",
        "department",
        "transaction_type",
        "amount",
        "transaction_date",
    ],

    "sales": [
        "company_id",
        "product_id",
        "product_name",
        "quantity",
        "revenue",
        "sale_date",
    ],
}


def validate_data(df, department):

    print("\nStarting Data Validation...")

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
    # Check department
    # ==========================================

    if department not in REQUIRED_COLUMNS:

        raise ValueError(
            f"Unknown department: {department}"
        )

    required = REQUIRED_COLUMNS[department]

    # ==========================================
    # Check required columns
    # ==========================================

    missing_columns = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing_columns:

        raise ValueError(
            "Missing required columns: "
            + ", ".join(missing_columns)
        )

    print("Required columns validated.")

    # ==========================================
    # Remove completely empty rows
    # ==========================================

    before = len(df)

    df = df.dropna(how="all")

    print(
        f"Empty rows removed: "
        f"{before - len(df)}"
    )

    # ==========================================
    # Remove duplicate rows
    # ==========================================

    duplicates = df.duplicated().sum()

    if duplicates > 0:

        print(
            f"Duplicate rows found: "
            f"{duplicates}"
        )

        df = df.drop_duplicates()

    # ==========================================
    # Remove spaces from text
    # ==========================================

    for column in df.columns:

        if df[column].dtype == "object":

            df[column] = (
                df[column]
                .astype(str)
                .str.strip()
            )

    # ==========================================
    # Validate transaction type
    # ==========================================

    if department == "finance":

        valid_types = [
            "revenue",
            "expense"
        ]

        df["transaction_type"] = (
            df["transaction_type"]
            .str.lower()
        )

        invalid = ~df[
            "transaction_type"
        ].isin(valid_types)

        if invalid.any():

            raise ValueError(
                "Finance transactionType must be "
                "'revenue' or 'expense'."
            )

    print(
        f"Rows after validation: {len(df)}"
    )

    print(
        "Validation completed successfully."
    )

    return df