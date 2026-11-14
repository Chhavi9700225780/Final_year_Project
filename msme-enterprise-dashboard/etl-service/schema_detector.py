import re


# ============================================================
# FIELD ALIASES
# ============================================================

FIELD_ALIASES = {

    # ========================================================
    # PRODUCTION
    # ========================================================

    "production": {

        "productionId": [
            "productionid",
            "production_id",
            "prodid",
            "prod_id",
        ],

        "productionDate": [
            "date",
            "productiondate",
            "production_date",
            "proddate",
        ],

        "productionLine": [
            "line",
            "productionline",
            "production_line",
            "assemblyline",
            "assembly_line",
        ],

        "productName": [
            "product",
            "productname",
            "product_name",
            "item",
            "itemname",
            "item_name",
        ],

        "plannedQuantity": [
            "plannedqty",
            "planned_qty",
            "plannedquantity",
            "planned_quantity",
            "planned",
            "target",
            "targetqty",
            "targetquantity",
        ],

        "actualQuantity": [
            "actualqty",
            "actual_qty",
            "actualquantity",
            "actual_quantity",
            "actual",
            "produced",
            "producedqty",
            "producedquantity",
        ],

        "efficiencyPct": [
            "efficiencypct",
            "efficiency_pct",
            "efficiency",
            "efficiencyrate",
        ],

        "defectiveQuantity": [
            "defectqty",
            "defect_qty",
            "defectiveqty",
            "defective_qty",
            "defectivequantity",
            "defective_quantity",
            "defects",
            "rejectedqty",
            "rejectedquantity",
        ],

        "productionCost": [
            "productioncost",
            "production_cost",
            "cost",
            "productionexpense",
        ],

        "status": [
            "status",
            "productionstatus",
            "production_status",
            "state",
        ],
    },


    # ========================================================
    # INVENTORY
    # ========================================================

    "inventory": {

        # IMPORTANT:
        # MongoDB uses productId, NOT inventoryId
        "productId": [
            "productid",
            "product_id",
            "inventoryid",
            "inventory_id",
            "invid",
            "inv_id",
        ],

        # IMPORTANT:
        # MongoDB uses productName, NOT itemName
        "productName": [
            "productname",
            "product_name",
            "product",
            "itemname",
            "item_name",
            "item",
        ],

        "openingStock": [
            "openingstock",
            "opening_stock",
            "opening",
            "openingqty",
            "openingquantity",
        ],

        "producedQuantity": [
            "producedquantity",
            "produced_quantity",
            "producedqty",
            "produced_qty",
            "produced",
            "productionquantity",
            "production_quantity",
        ],

        "soldQuantity": [
            "soldquantity",
            "sold_quantity",
            "soldqty",
            "sold_qty",
            "sold",
            "quantitysold",
            "quantity_sold",
        ],

        "closingStock": [
            "closingstock",
            "closing_stock",
            "closing",
            "currentstock",
            "current_stock",
            "stock",
            "availablestock",
            "available_stock",
        ],

        "minimumStock": [
            "minimumstock",
            "minimum_stock",
            "minstock",
            "min_stock",
            "reorderlevel",
            "reorder_level",
            "reorderpoint",
            "reorder_point",
        ],

        "warehouse": [
            "warehouse",
            "warehouse_name",
            "warehousename",
            "location",
            "storage",
        ],

        "recordDate": [
            "recorddate",
            "record_date",
            "date",
            "inventorydate",
            "inventory_date",
        ],
    },


    # ========================================================
    # RAW MATERIALS
    # ========================================================

    "raw-materials": {

        "materialId": [
            "materialid",
            "material_id",
            "materialcode",
            "material_code",
            "materialno",
        ],

        "materialName": [
            "materialname",
            "material_name",
            "material",
            "item",
            "itemname",
            "item_name",
        ],

        "supplier": [
            "supplier",
            "vendor",
            "vendorname",
            "vendor_name",
        ],

        "currentStock": [
            "currentstock",
            "current_stock",
            "stock",
            "availablestock",
            "available_stock",
        ],

        "minimumStock": [
            "minimumstock",
            "minimum_stock",
            "minstock",
            "min_stock",
            "reorderlevel",
            "reorder_level",
        ],

        "unitCost": [
            "unitcost",
            "unit_cost",
            "costperunit",
            "cost_per_unit",
            "priceperunit",
            "price_per_unit",
        ],

        "lastUpdated": [
            "lastupdated",
            "last_updated",
            "updated",
            "updatedat",
            "updated_at",
        ],
    },


    # ========================================================
    # FINANCE
    # ========================================================

    "finance": {

        "transactionId": [
            "transactionid",
            "transaction_id",
            "transid",
            "trans_id",
            "transactionno",
        ],

        "transactionDate": [
            "date",
            "transactiondate",
            "transaction_date",
            "transdate",
            "trans_date",
        ],

        "category": [
            "category",
            "transactioncategory",
            "transaction_category",
        ],

        "transactionType": [
            "type",
            "transactiontype",
            "transaction_type",
            "transtype",
            "trans_type",
        ],

        "description": [
            "description",
            "details",
            "particulars",
            "remarks",
            "narration",
        ],

        "amount": [
            "amount",
            "amountinr",
            "amount_inr",
            "revenue",
            "value",
            "transactionamount",
            "transaction_amount",
        ],
    },


    # ========================================================
    # SALES
    # ========================================================
    "sales": {

        "saleId": [
            "saleid",
            "sale_id",
            "salesid",
            "sales_id",
            "saleno",
            "sale_number",
        ],

        "saleDate": [
            "date",
            "saledate",
            "sale_date",
            "salesdate",
            "sales_date",
        ],

        "orderId": [
            "orderid",
            "order_id",
            "orderno",
            "order_no",
            "ordernumber",
        ],

        "customerName": [
            "customer",
            "customername",
            "customer_name",
            "client",
            "clientname",
            "client_name",
        ],

        "productId": [
            "productid",
            "product_id",
            "productcode",
            "product_code",
            "itemid",
            "item_id",
        ],

        "productName": [
            "product",
            "productname",
            "product_name",
            "item",
            "itemname",
            "item_name",
        ],

        "quantity": [
            "quantity",
            "qty",
            "soldqty",
            "sold_qty",
            "units",
            "units_sold",
        ],

        "revenue": [
            "amount",
            "amountinr",
            "amount_inr",
            "revenue",
            "salesvalue",
            "sales_value",
            "totalamount",
            "total_amount",
        ],

        "paymentMethod": [
            "paymentmethod",
            "payment_method",
            "payment",
            "paymenttype",
            "payment_type",
        ],

        "status": [
            "status",
            "salestatus",
            "sale_status",
            "orderstatus",
            "order_status",
        ],

        "customerRegion": [
            "customerregion",
            "customer_region",
            "region",
            "salesregion",
            "sales_region",
            "area",
            "zone",
            "territory",
        ],
    },
}


# ============================================================
# NORMALIZE COLUMN NAME
# ============================================================

def normalize_column_name(name):

    name = str(name).strip().lower()

    name = re.sub(
        r"[^a-z0-9]",
        "",
        name
    )

    return name


# ============================================================
# DETECT COLUMN MAPPING
# ============================================================

def detect_mapping(
    columns,
    department
):

    if department not in FIELD_ALIASES:

        raise ValueError(
            f"Unsupported department: {department}"
        )

    aliases = FIELD_ALIASES[
        department
    ]

    normalized_columns = {
        normalize_column_name(column): column
        for column in columns
    }

    mapping = []

    used_columns = set()


    # ========================================================
    # MATCH KNOWN FIELDS
    # ========================================================

    for forge_field, field_aliases in aliases.items():

        matched_column = None

        for alias in field_aliases:

            normalized_alias = (
                normalize_column_name(alias)
            )

            if normalized_alias in normalized_columns:

                original_column = (
                    normalized_columns[
                        normalized_alias
                    ]
                )

                if original_column not in used_columns:

                    matched_column = original_column

                    break

        if matched_column:

            used_columns.add(
                matched_column
            )

            mapping.append({

                "uploadedColumn":
                    matched_column,

                "forgeField":
                    forge_field,

                "matched":
                    True,

                "confidence":
                    "high",
            })


    # ========================================================
    # UNMAPPED COLUMNS
    # ========================================================

    for column in columns:

        if column not in used_columns:

            mapping.append({

                "uploadedColumn":
                    column,

                "forgeField":
                    None,

                "matched":
                    False,

                "confidence":
                    "unmapped",
            })


    return mapping


# ============================================================
# APPLY DETECTED MAPPING
# ============================================================

def apply_mapping(
    dataframe,
    mapping
):

    rename_mapping = {}

    for item in mapping:

        uploaded_column = (
            item.get("uploadedColumn")
        )

        forge_field = (
            item.get("forgeField")
        )

        if uploaded_column and forge_field:

            rename_mapping[
                uploaded_column
            ] = forge_field


    if rename_mapping:

        dataframe = dataframe.rename(
            columns=rename_mapping
        )


    return dataframe
"""
import re


# ============================================================
# FIELD ALIASES
# ============================================================

FIELD_ALIASES = {

    # ========================================================
    # PRODUCTION
    # ========================================================

    "production": {

        "productionId": [
            "productionid",
            "production_id",
            "prodid",
            "prod_id",
        ],

        "productionDate": [
            "date",
            "productiondate",
            "production_date",
            "proddate",
        ],

        "productionLine": [
            "line",
            "productionline",
            "production_line",
            "assemblyline",
            "assembly_line",
        ],

        "productName": [
            "product",
            "productname",
            "product_name",
            "item",
            "itemname",
            "item_name",
        ],

        "plannedQuantity": [
            "plannedqty",
            "planned_qty",
            "plannedquantity",
            "planned_quantity",
            "planned",
            "target",
            "targetqty",
            "targetquantity",
        ],

        "actualQuantity": [
            "actualqty",
            "actual_qty",
            "actualquantity",
            "actual_quantity",
            "actual",
            "produced",
            "producedqty",
            "producedquantity",
        ],

        "efficiencyPct": [
            "efficiencypct",
            "efficiency_pct",
            "efficiency",
            "efficiencyrate",
        ],

        "defectiveQuantity": [
            "defectqty",
            "defect_qty",
            "defectiveqty",
            "defective_qty",
            "defectivequantity",
            "defective_quantity",
            "defects",
            "rejectedqty",
            "rejectedquantity",
        ],

        "productionCost": [
            "productioncost",
            "production_cost",
            "cost",
            "productionexpense",
        ],

        "status": [
            "status",
            "productionstatus",
            "production_status",
            "state",
        ],
    },


    # ========================================================
    # INVENTORY
    # ========================================================

    "inventory": {

        # IMPORTANT:
        # MongoDB uses productId, NOT inventoryId
        "productId": [
            "productid",
            "product_id",
            "inventoryid",
            "inventory_id",
            "invid",
            "inv_id",
        ],

        # IMPORTANT:
        # MongoDB uses productName, NOT itemName
        "productName": [
            "productname",
            "product_name",
            "product",
            "itemname",
            "item_name",
            "item",
        ],

        "openingStock": [
            "openingstock",
            "opening_stock",
            "opening",
            "openingqty",
            "openingquantity",
        ],

        "producedQuantity": [
            "producedquantity",
            "produced_quantity",
            "producedqty",
            "produced_qty",
            "produced",
            "productionquantity",
            "production_quantity",
        ],

        "soldQuantity": [
            "soldquantity",
            "sold_quantity",
            "soldqty",
            "sold_qty",
            "sold",
            "quantitysold",
            "quantity_sold",
        ],

        "closingStock": [
            "closingstock",
            "closing_stock",
            "closing",
            "currentstock",
            "current_stock",
            "stock",
            "availablestock",
            "available_stock",
        ],

        "minimumStock": [
            "minimumstock",
            "minimum_stock",
            "minstock",
            "min_stock",
            "reorderlevel",
            "reorder_level",
            "reorderpoint",
            "reorder_point",
        ],

        "warehouse": [
            "warehouse",
            "warehouse_name",
            "warehousename",
            "location",
            "storage",
        ],

        "recordDate": [
            "recorddate",
            "record_date",
            "date",
            "inventorydate",
            "inventory_date",
        ],
    },


    # ========================================================
    # RAW MATERIALS
    # ========================================================

    "raw-materials": {

        "materialId": [
            "materialid",
            "material_id",
            "materialcode",
            "material_code",
            "materialno",
        ],

        "materialName": [
            "materialname",
            "material_name",
            "material",
            "item",
            "itemname",
            "item_name",
        ],

        "supplier": [
            "supplier",
            "vendor",
            "vendorname",
            "vendor_name",
        ],

        "currentStock": [
            "currentstock",
            "current_stock",
            "stock",
            "availablestock",
            "available_stock",
        ],

        "minimumStock": [
            "minimumstock",
            "minimum_stock",
            "minstock",
            "min_stock",
            "reorderlevel",
            "reorder_level",
        ],

        "unitCost": [
            "unitcost",
            "unit_cost",
            "costperunit",
            "cost_per_unit",
            "priceperunit",
            "price_per_unit",
        ],

        "lastUpdated": [
            "lastupdated",
            "last_updated",
            "updated",
            "updatedat",
            "updated_at",
        ],
    },


    # ========================================================
    # FINANCE
    # ========================================================

    "finance": {

        "transactionId": [
            "transactionid",
            "transaction_id",
            "transid",
            "trans_id",
            "transactionno",
        ],

        "transactionDate": [
            "date",
            "transactiondate",
            "transaction_date",
            "transdate",
            "trans_date",
        ],

        "category": [
            "category",
            "transactioncategory",
            "transaction_category",
        ],

        "transactionType": [
            "type",
            "transactiontype",
            "transaction_type",
            "transtype",
            "trans_type",
        ],

        "description": [
            "description",
            "details",
            "particulars",
            "remarks",
            "narration",
        ],

        "amount": [
            "amount",
            "amountinr",
            "amount_inr",
            "revenue",
            "value",
            "transactionamount",
            "transaction_amount",
        ],
    },


    # ========================================================
    # SALES
    # ========================================================
    "sales": {

        "saleId": [
            "saleid",
            "sale_id",
            "salesid",
            "sales_id",
            "saleno",
            "sale_number",
        ],

        "saleDate": [
            "date",
            "saledate",
            "sale_date",
            "salesdate",
            "sales_date",
        ],

        "orderId": [
            "orderid",
            "order_id",
            "orderno",
            "order_no",
            "ordernumber",
        ],

        "customerName": [
            "customer",
            "customername",
            "customer_name",
            "client",
            "clientname",
            "client_name",
        ],

        "productId": [
            "productid",
            "product_id",
            "productcode",
            "product_code",
            "itemid",
            "item_id",
        ],

        "productName": [
            "product",
            "productname",
            "product_name",
            "item",
            "itemname",
            "item_name",
        ],

        "quantity": [
            "quantity",
            "qty",
            "soldqty",
            "sold_qty",
            "units",
            "units_sold",
        ],

        "revenue": [
            "amount",
            "amountinr",
            "amount_inr",
            "revenue",
            "salesvalue",
            "sales_value",
            "totalamount",
            "total_amount",
        ],

        "paymentMethod": [
            "paymentmethod",
            "payment_method",
            "payment",
            "paymenttype",
            "payment_type",
        ],

        "status": [
            "status",
            "salestatus",
            "sale_status",
            "orderstatus",
            "order_status",
        ],

        "customerRegion": [
            "customerregion",
            "customer_region",
            "region",
            "salesregion",
            "sales_region",
            "area",
            "zone",
            "territory",
        ],
    },
}


# ============================================================
# NORMALIZE COLUMN NAME
# ============================================================

def normalize_column_name(name):

    name = str(name).strip().lower()

    name = re.sub(
        r"[^a-z0-9]",
        "",
        name
    )

    return name


# ============================================================
# DETECT COLUMN MAPPING
# ============================================================

def detect_mapping(
    columns,
    department
):

    if department not in FIELD_ALIASES:

        raise ValueError(
            f"Unsupported department: {department}"
        )

    aliases = FIELD_ALIASES[
        department
    ]

    normalized_columns = {
        normalize_column_name(column): column
        for column in columns
    }

    mapping = []

    used_columns = set()


    # ========================================================
    # MATCH KNOWN FIELDS
    # ========================================================

    for forge_field, field_aliases in aliases.items():

        matched_column = None

        for alias in field_aliases:

            normalized_alias = (
                normalize_column_name(alias)
            )

            if normalized_alias in normalized_columns:

                original_column = (
                    normalized_columns[
                        normalized_alias
                    ]
                )

                if original_column not in used_columns:

                    matched_column = original_column

                    break

        if matched_column:

            used_columns.add(
                matched_column
            )

            mapping.append({

                "uploadedColumn":
                    matched_column,

                "forgeField":
                    forge_field,

                "matched":
                    True,

                "confidence":
                    "high",
            })


    # ========================================================
    # UNMAPPED COLUMNS
    # ========================================================

    for column in columns:

        if column not in used_columns:

            mapping.append({

                "uploadedColumn":
                    column,

                "forgeField":
                    None,

                "matched":
                    False,

                "confidence":
                    "unmapped",
            })


    return mapping


# ============================================================
# APPLY DETECTED MAPPING
# ============================================================

def apply_mapping(
    dataframe,
    mapping
):

    rename_mapping = {}

    for item in mapping:

        uploaded_column = (
            item.get("uploadedColumn")
        )

        forge_field = (
            item.get("forgeField")
        )

        if uploaded_column and forge_field:

            rename_mapping[
                uploaded_column
            ] = forge_field


    if rename_mapping:

        dataframe = dataframe.rename(
            columns=rename_mapping
        )


    return dataframe
"""