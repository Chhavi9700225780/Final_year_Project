import sys
import json

try:

    sys.stdout.reconfigure(
        encoding="utf-8"
    )

    sys.stderr.reconfigure(
        encoding="utf-8"
    )

except Exception:

    pass


from extractor import extract_data
from validator import validate_data
from transformer import transform_data
from loader import load_data
from analytics import generate_kpis
from alert_engine import generate_alerts
from utils import dataframe_summary
from schema_detector import detect_mapping


# ============================================================
# NORMAL ETL PIPELINE
# ============================================================

def start_pipeline(
    file_path,
    department,
    upload_job_id,
    company_id
):

    print("=" * 60)
    print("Enterprise ETL Pipeline Started")
    print("=" * 60)

    print(
        f"File       : {file_path}"
    )

    print(
        f"Department : {department}"
    )

    print(
        f"Company ID : {company_id}"
    )

    print(
        f"Upload Job : {upload_job_id}"
    )

    # ========================================================
    # 1. EXTRACT
    # ========================================================

    dataframe = extract_data(
        file_path
    )

    print(
        "\nExtraction Completed"
    )

    print(
        dataframe_summary(
            dataframe
        )
    )

    # ========================================================
    # 2. VALIDATE + AUTO MAP
    # ========================================================

    dataframe = validate_data(
        dataframe,
        department
    )

    print(
        "\nValidation Completed"
    )

    # ========================================================
    # 3. TRANSFORM
    # ========================================================

    dataframe = transform_data(
        dataframe,
        department
    )

    print(
        "\nTransformation Completed"
    )

    # ========================================================
    # 4. LOAD
    # ========================================================

    inserted = load_data(

        dataframe,

        department,

        upload_job_id,

        company_id
    )

    print(
        f"\n{inserted} records "
        f"inserted into MongoDB."
    )

    # ========================================================
    # 5. ANALYTICS
    # ========================================================

    generate_kpis(
        department,
        company_id
    )

    print(
        "\nKPI Generation Completed"
    )

    # ========================================================
    # 6. ALERTS
    # ========================================================

    alerts = generate_alerts(
        department,
        company_id
    )

    print(
        "\nAlert Generation Completed"
    )

    # ========================================================
    # COMPLETE
    # ========================================================

    print(
        "\n" + "=" * 60
    )

    print(
        "Pipeline Finished Successfully"
    )

    print(
        "=" * 60
    )

    return {

        "recordCount":
            inserted,

        "alerts":
            alerts,

    }


# ============================================================
# DATASET PREVIEW
# ============================================================

def preview_dataset(
    file_path,
    department
):

    print(
        "\n" + "=" * 60
    )

    print(
        "DATASET SCHEMA DETECTION"
    )

    print(
        "=" * 60
    )

    print(
        f"File       : {file_path}"
    )

    print(
        f"Department : {department}"
    )

    # ========================================================
    # EXTRACT
    # ========================================================

    dataframe = extract_data(
        file_path
    )

    columns = list(
        dataframe.columns
    )

    # ========================================================
    # DETECT MAPPING
    # ========================================================

    mapping = detect_mapping(
        columns,
        department
    )

    result = {

        "success":
            True,

        "department":
            department,

        "columns":
            columns,

        "mapping":
            mapping,

    }

    print(
        "\nSchema detection completed."
    )

    # ========================================================
    # JSON RESULT
    # ========================================================

    print(
        "SCHEMA_RESULT:"
        + json.dumps(
            result,
            ensure_ascii=False
        )
    )


# ============================================================
# MAIN
# ============================================================

def main():

    allowed_departments = [

        "production",
        "inventory",
        "raw-materials",
        "finance",
        "sales",

    ]

    # ========================================================
    # PREVIEW MODE
    # ========================================================

    if (
        len(sys.argv) >= 2
        and sys.argv[1] == "preview"
    ):

        if len(sys.argv) != 4:

            print(
                "Usage: python app.py "
                "preview <file_path> "
                "<department>"
            )

            sys.exit(1)

        file_path = sys.argv[2]

        department = sys.argv[3]

        if department not in allowed_departments:

            print(
                f"Invalid department: "
                f"{department}"
            )

            sys.exit(1)

        try:

            preview_dataset(
                file_path,
                department
            )

            sys.exit(0)

        except Exception as error:

            print(
                f"Schema detection failed: "
                f"{error}"
            )

            sys.exit(1)

    # ========================================================
    # NORMAL ETL MODE
    # ========================================================

    if len(sys.argv) != 5:

        print(
            "Usage: python app.py "
            "<file_path> <department> "
            "<upload_job_id> <company_id>"
        )

        sys.exit(1)

    file_path = sys.argv[1]

    department = sys.argv[2]

    upload_job_id = sys.argv[3]

    company_id = sys.argv[4]

    # ========================================================
    # VALIDATE DEPARTMENT
    # ========================================================

    if department not in allowed_departments:

        print(
            f"Invalid department: "
            f"{department}"
        )

        sys.exit(1)

    # ========================================================
    # RUN PIPELINE
    # ========================================================

    try:

        start_pipeline(

            file_path,

            department,

            upload_job_id,

            company_id

        )

    except Exception as error:

        print(
            f"ETL Pipeline Failed: "
            f"{error}"
        )

        sys.exit(1)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()