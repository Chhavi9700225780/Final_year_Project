from pymongo import MongoClient
from pymongo.server_api import ServerApi
from config import MONGO_URI, DATABASE_NAME

_client = None


def get_client():
    global _client
    if _client is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI is not configured")
        _client = MongoClient(
            MONGO_URI,
            server_api=ServerApi("1"),
            connectTimeoutMS=10000,
            serverSelectionTimeoutMS=10000,
            socketTimeoutMS=30000,
            maxPoolSize=20,
            minPoolSize=1,
            retryWrites=True,
            appname="FORGE-ETL",
        )
        _client.admin.command("ping")
    return _client


def get_db():
    return get_client()[DATABASE_NAME]


def close_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None
