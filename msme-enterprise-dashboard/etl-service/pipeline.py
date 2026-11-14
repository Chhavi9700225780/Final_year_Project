from extractor import extract_data
from validator import validate_data
from transformer import transform_data
from loader import load_data
from analytics import generate_kpis
from alert_engine import generate_alerts
from utils import dataframe_summary


def preview_dataset(file_path, department):
    dataframe = extract_data(file_path)
    from schema_detector import detect_mapping
    mapping = detect_mapping(list(dataframe.columns), department)
    return {"success": True, "department": department, "columns": list(dataframe.columns), "mapping": mapping, "summary": dataframe_summary(dataframe)}


def start_pipeline(file_path, department, upload_job_id, company_id):
    dataframe = extract_data(file_path)
    validated = validate_data(dataframe, department)
    transformed = transform_data(validated, department)
    inserted = load_data(transformed, department, upload_job_id, company_id)
    kpis = generate_kpis(department, company_id)
    alerts = generate_alerts(department, company_id)
    return {"recordCount": inserted, "alerts": alerts, "kpis": kpis, "summary": dataframe_summary(transformed)}
