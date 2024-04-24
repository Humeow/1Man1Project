from sqlmodel import create_engine
from sqlmodel import SQLModel

import os

from dotenv import load_dotenv

load_dotenv()

path = os.environ.get('DB_PATH', 'sqlite:///db/database.sqlite3')

path = path.strip()

engine = create_engine(
    path
)

def create_db_and_tables(): # Database table makes
    SQLModel.metadata.create_all(engine)
