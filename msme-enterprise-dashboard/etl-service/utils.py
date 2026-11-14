import os
from pathlib import Path
import pandas as pd
from config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_ROWS


def generate_file_id():
    import uuid
    return str(uuid.uuid4())


def timestamp():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)


def is_allowed_file(filename):
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def read_dataset(file_path):
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError("Uploaded file was not found")
    if path.stat().st_size > MAX_FILE_SIZE:
        raise ValueError("File exceeds the configured upload limit")
    ext = path.suffix.lower()
    if ext == ".csv":
        df = pd.read_csv(path, encoding="utf-8-sig", nrows=MAX_ROWS + 1)
    elif ext == ".xlsx":
        df = pd.read_excel(path, engine="openpyxl", nrows=MAX_ROWS + 1)
    else:
        raise ValueError("Only CSV and XLSX files are supported")
    if len(df) > MAX_ROWS:
        raise ValueError(f"Dataset exceeds the maximum of {MAX_ROWS} rows")
    if df.empty:
        raise ValueError("The uploaded dataset is empty")
    if len(df.columns) == 0 or len(df.columns) > 200:
        raise ValueError("Dataset must contain between 1 and 200 columns")
    if df.columns.duplicated().any():
        raise ValueError("Dataset contains duplicate column names")
    return df


def standardize_column_names(df):
    df = df.copy()
    df.columns = (df.columns.astype(str).str.strip().str.lower().str.replace(r"[^a-z0-9]+", "_", regex=True).str.strip("_"))
    if any(not column for column in df.columns):
        raise ValueError("Dataset contains an empty column name")
    if df.columns.duplicated().any():
        raise ValueError("Column names become duplicated after normalization")
    return df


def dataframe_summary(df):
    return {"rows": int(len(df)), "columns": int(len(df.columns)), "column_names": list(df.columns)}

"""
import os
import uuid
import pandas as pd
from datetime import datetime

from config import ALLOWED_EXTENSIONS


def generate_file_id():

    return str(uuid.uuid4())


def timestamp():

    return datetime.now()


def is_allowed_file(filename):

    extension = os.path.splitext(filename)[1].lower()

    return extension in ALLOWED_EXTENSIONS


def read_dataset(file_path):

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".csv":

        return pd.read_csv(file_path)

    elif extension == ".xlsx":

        return pd.read_excel(file_path)

    else:

        raise Exception("Unsupported file format")


def remove_duplicate_rows(df):

    return df.drop_duplicates()


def fill_missing_values(df):

    return df.fillna("")


def standardize_column_names(df):

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    return df


def dataframe_summary(df):

    return {

        "rows": len(df),

        "columns": len(df.columns),

        "column_names": list(df.columns)

    }

"""