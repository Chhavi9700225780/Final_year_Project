import pandas as pd
from schema_detector import detect_mapping, apply_mapping

REQUIRED_FIELDS = {
    "production": ["productName", "plannedQuantity", "actualQuantity", "productionDate"],
    "inventory": ["productId", "productName", "openingStock", "closingStock", "minimumStock", "recordDate"],
    "raw-materials": ["materialId", "materialName", "supplier", "currentStock", "minimumStock", "unitCost", "lastUpdated"],
    "finance": ["transactionId", "transactionType", "amount", "transactionDate"],
    "sales": ["saleId", "orderId", "customerName", "productName", "quantity", "revenue", "saleDate"],
}
DATE_FIELDS = {"production": "productionDate", "inventory": "recordDate", "raw-materials": "lastUpdated", "finance": "transactionDate", "sales": "saleDate"}
NUMERIC_FIELDS = {
    "production": ["plannedQuantity", "actualQuantity", "defectiveQuantity", "productionCost"],
    "inventory": ["openingStock", "closingStock", "minimumStock"],
    "raw-materials": ["currentStock", "minimumStock", "unitCost"],
    "finance": ["amount"],
    "sales": ["quantity", "revenue"],
}


def validate_data(df, department):
    if department not in REQUIRED_FIELDS:
        raise ValueError("Unsupported department")
    if df.empty:
        raise ValueError("Dataset contains no rows")
    mapping = detect_mapping(list(df.columns), department)
    df = apply_mapping(df.copy(), mapping)
    missing = [field for field in REQUIRED_FIELDS[department] if field not in df.columns]
    if missing:
        raise ValueError("Unable to identify required fields: " + ", ".join(missing))
    df = df.dropna(how="all").copy()
    if df.empty:
        raise ValueError("Dataset contains no usable rows")
    for column in df.columns:
        if pd.api.types.is_object_dtype(df[column]):
            df[column] = df[column].map(lambda x: x.strip() if isinstance(x, str) else x)
    for field in NUMERIC_FIELDS[department]:
        if field in df.columns:
            original = df[field]
            converted = pd.to_numeric(original, errors="coerce")
            invalid = original.notna() & converted.isna()
            if invalid.any():
                raise ValueError(f"Column {field} contains non-numeric values")
            if converted.isna().any():
                raise ValueError(f"Column {field} contains missing values")
            if not converted.map(lambda x: pd.notna(x) and abs(float(x)) != float('inf')).all():
                raise ValueError(f"Column {field} contains invalid numeric values")
            # Negative financial amounts are retained; negative stock/quantity values are rejected.
            if department != "finance" and (converted < 0).any():
                raise ValueError(f"Column {field} cannot contain negative values")
            df[field] = converted
    date_field = DATE_FIELDS[department]
    parsed_dates = pd.to_datetime(df[date_field], errors="coerce", dayfirst=True)
    if parsed_dates.isna().any():
        raise ValueError(f"Column {date_field} contains missing or invalid dates")
    df[date_field] = parsed_dates
    if department == "finance":
        df["transactionType"] = df["transactionType"].astype(str).str.strip().str.lower()
        invalid = ~df["transactionType"].isin(["revenue", "expense"])
        if invalid.any():
            raise ValueError("transactionType must be revenue or expense")
    if department == "inventory":
        for field in ("producedQuantity", "soldQuantity"):
            if field not in df.columns:
                df[field] = 0
    if department == "production" and "defectiveQuantity" not in df.columns:
        df["defectiveQuantity"] = 0
    df = df.drop_duplicates().reset_index(drop=True)
    return df

"""
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

"""