from schema_detector import (
    detect_mapping,
    apply_mapping
)


# ============================================================
# REQUIRED FIELDS
# ============================================================

REQUIRED_FIELDS = {

    "production": [
        "productName",
        "plannedQuantity",
        "actualQuantity",
        "productionDate",
    ],

    "inventory": [
        "productId",
        "productName",
        "openingStock",
        "closingStock",
        "minimumStock",
        "recordDate",
    ],

    "raw-materials": [
        "materialId",
        "materialName",
        "supplier",
        "currentStock",
        "minimumStock",
        "unitCost",
        "lastUpdated",
    ],

    "finance": [
        "transactionId",
        "transactionType",
        "amount",
        "transactionDate",
    ],

    "sales": [
        "saleId",
        "orderId",
        "customerName",
        "productName",
        "quantity",
        "revenue",
        "saleDate",
    ],
}


# ============================================================
# VALIDATE DATA
# ============================================================

def validate_data(
    df,
    department
):

    print("\nStarting Data Validation...")


    # ========================================================
    # CHECK DEPARTMENT
    # ========================================================

    if department not in REQUIRED_FIELDS:

        raise ValueError(
            f"Unknown department: {department}"
        )


    # ========================================================
    # DETECT COLUMN MAPPING
    # ========================================================

    original_columns = list(
        df.columns
    )

    mapping = detect_mapping(
        original_columns,
        department
    )


    print("\nDetected Column Mapping:")

    for item in mapping:

        if item["matched"]:

            print(
                f"  {item['uploadedColumn']} "
                f"-> "
                f"{item['forgeField']}"
            )

        else:

            print(
                f"  {item['uploadedColumn']} "
                f"-> UNMAPPED"
            )


    # ========================================================
    # APPLY MAPPING
    # ========================================================

    df = apply_mapping(
        df,
        mapping
    )


    # ========================================================
    # REQUIRED FIELDS
    # ========================================================

    required = REQUIRED_FIELDS[
        department
    ]

    missing_fields = [

        field

        for field in required

        if field not in df.columns

    ]


    if missing_fields:

        raise ValueError(
            "Unable to identify required "
            "dataset fields: "
            + ", ".join(missing_fields)
        )


    print(
        "\nRequired fields successfully identified."
    )


    # ========================================================
    # REMOVE EMPTY ROWS
    # ========================================================

    before = len(df)

    df = df.dropna(
        how="all"
    )

    print(
        f"Empty rows removed: "
        f"{before - len(df)}"
    )


    # ========================================================
    # REMOVE DUPLICATES
    # ========================================================

    duplicates = df.duplicated().sum()

    if duplicates > 0:

        print(
            f"Duplicate rows found: "
            f"{duplicates}"
        )

        df = df.drop_duplicates()


    # ========================================================
    # CLEAN TEXT
    # ========================================================

    for column in df.columns:

        if df[column].dtype == "object":

            df[column] = (
                df[column]
                .astype(str)
                .str.strip()
            )


    # ========================================================
    # FINANCE VALIDATION
    # ========================================================

    if department == "finance":

        df["transactionType"] = (
            df["transactionType"]
            .astype(str)
            .str.strip()
            .str.lower()
        )

        valid_types = [
            "revenue",
            "expense",
        ]

        invalid = ~df[
            "transactionType"
        ].isin(valid_types)


        if invalid.any():

            invalid_values = (
                df.loc[
                    invalid,
                    "transactionType"
                ]
                .unique()
                .tolist()
            )

            raise ValueError(
                "Invalid finance transaction type(s): "
                + ", ".join(
                    map(str, invalid_values)
                )
                + ". Allowed values: revenue, expense."
            )


    # ========================================================
    # FINAL RESULT
    # ========================================================

    print(
        f"Rows after validation: {len(df)}"
    )

    print(
        "Validation completed successfully."
    )

    return df