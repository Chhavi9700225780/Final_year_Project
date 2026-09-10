import pandas as pd


# ============================================================
# TRANSFORM DATA
# ============================================================

def transform_data(
    df,
    department
):

    print(
        "\nStarting Data Transformation..."
    )


    df = df.copy()


    # ========================================================
    # DATE COLUMNS
    # ========================================================

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
                errors="coerce",
                dayfirst=True
            )


    # ========================================================
    # NUMERIC COLUMNS
    # ========================================================

    numeric_columns = [

        # Production
        "plannedQuantity",
        "actualQuantity",
        "defectiveQuantity",
        "productionCost",
        "efficiencyPct",

        # Inventory
        "openingStock",
        "producedQuantity",
        "soldQuantity",
        "closingStock",
        "minimumStock",

        # Raw Materials
        "currentStock",
        "unitCost",

        # Finance
        "amount",

        # Sales
        "quantity",
        "revenue",

    ]


    for column in numeric_columns:

        if column in df.columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

            df[column] = (
                df[column]
                .fillna(0)
                .clip(lower=0)
            )


    # ========================================================
    # TEXT CLEANING
    # ========================================================

    for column in df.columns:

        if df[column].dtype == "object":

            df[column] = (
                df[column]
                .astype(str)
                .str.strip()
            )


    # ========================================================
    # NORMALIZE ENUM-LIKE FIELDS
    # ========================================================

    if "transactionType" in df.columns:

        df["transactionType"] = (
            df["transactionType"]
            .astype(str)
            .str.strip()
            .str.lower()
        )


    if "status" in df.columns:

        df["status"] = (
            df["status"]
            .astype(str)
            .str.strip()
        )


    # ========================================================
    # INVENTORY DEFAULTS
    # ========================================================

    if department == "inventory":

        if "producedQuantity" not in df.columns:
            df["producedQuantity"] = 0

        if "soldQuantity" not in df.columns:
            df["soldQuantity"] = 0


    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    before = len(df)

    df = df.drop_duplicates()

    print(
        f"Duplicate rows removed: "
        f"{before - len(df)}"
    )


    # ========================================================
    # RESET INDEX
    # ========================================================

    df = df.reset_index(
        drop=True
    )


    # ========================================================
    # FINAL OUTPUT
    # ========================================================

    print(
        "Transformation Completed Successfully"
    )

    print(
        f"Final Rows : {len(df)}"
    )

    print(
        "Final Columns:"
    )

    print(
        list(df.columns)
    )


    return df