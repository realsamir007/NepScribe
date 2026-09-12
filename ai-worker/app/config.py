from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://nepscribe:nepscribe_dev_password@localhost:5433/nepscribe")