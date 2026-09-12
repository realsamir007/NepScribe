from fastapi import FastAPI
from app.database import test_database_connection

app = FastAPI(title="NepScribe AI Worker")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "nepscribe-ai-worker"
    }
    
    
@app.get("/health/database")
def database_health_check():
    result = test_database_connection()

    return {
        "status": "connected",
        "database": result[0],
        "user": result[1]
    }