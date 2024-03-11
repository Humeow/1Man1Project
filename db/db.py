from sqlmodel import create_engine
from sqlmodel import SQLModel

path = str()
with open('./db/path', 'r') as f:
    path = f.readline()

path = path.strip()

engine = create_engine(
    path
)

def create_db_and_tables(): # Database table makes
    SQLModel.metadata.create_all(engine)
