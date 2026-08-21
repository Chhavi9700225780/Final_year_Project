import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from extractor import extract_data
from validator import validate_data
from transformer import transform_data
from loader import load_data
from analytics import generate_kpis
from alert_engine import generate_alerts
from utils import dataframe_summary


def start_pipeline(file_path, department, upload_job_id):

    print("=" * 60)
    print("Enterprise ETL Pipeline Started")
    print("=" * 60)

    print(f"File       : {file_path}")
    print(f"Department : {department}")

    # ==========================================
    # 1. Extract
    # ==========================================

    dataframe = extract_data(file_path)

    print("\nExtraction Completed")

    print(dataframe_summary(dataframe))

    # ==========================================
    # 2. Validate
    # ==========================================

    dataframe = validate_data(
        dataframe,
        department
    )

    print("\nValidation Completed")

    # ==========================================
    # 3. Transform
    # ==========================================

    dataframe = transform_data(dataframe)

    print("\nTransformation Completed")

    # ==========================================
    # 4. Load
    # ==========================================

    inserted = load_data(
        dataframe,
        department,
        upload_job_id
    )

    print(
        f"\n{inserted} records inserted into MongoDB."
    )

    # ==========================================
    # 5. Analytics
    # ==========================================

    generate_kpis(department)

    print("\nKPI Generation Completed")

    # ==========================================
    # 6. Alerts
    # ==========================================

    generate_alerts(department)

    print("\nAlert Generation Completed")

    print("\n" + "=" * 60)
    print("Pipeline Finished Successfully")
    print("=" * 60)


def main():

    # ==========================================
    # Command Line Arguments
    # ==========================================

    if len(sys.argv) != 4:

        print(
            "Usage: python app.py <file_path> <department>"
        )

        sys.exit(1)

    file_path = sys.argv[1]

    department = sys.argv[2]

    upload_job_id = sys.argv[3]

    allowed_departments = [
        "production",
        "inventory",
        "raw-materials",
        "finance",
        "sales",
    ]

    if department not in allowed_departments:

        print(
            f"Invalid department: {department}"
        )

        sys.exit(1)

    try:

        start_pipeline(
            file_path,
            department,
            upload_job_id
        )

    except Exception as error:

        print(
            f"ETL Pipeline Failed: {error}"
        )

        sys.exit(1)


if __name__ == "__main__":

    main()