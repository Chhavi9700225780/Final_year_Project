import os
import pandas as pd

from utils import (
    read_dataset,
    is_allowed_file,
    standardize_column_names,
    dataframe_summary
)


def extract_data(file_path):

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found.")

    if not is_allowed_file(file_path):
        raise Exception("Unsupported file format.")

    print("\nReading Dataset...")

    dataframe = read_dataset(file_path)

    dataframe = standardize_column_names(dataframe)

    print("Dataset Loaded Successfully")

    print(dataframe_summary(dataframe))

    return dataframe