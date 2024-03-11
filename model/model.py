from typing import Optional

from sqlmodel import Field, Relationship, SQLModel, JSON, Column


class UserData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    email: Optional['str'] = Field(default=None, unique=True)
    password: str
    name: str
    age: int
