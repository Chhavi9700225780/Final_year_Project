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