from typing import Optional

from sqlmodel import Field, Relationship, SQLModel, JSON, Column
from sqlmodel import UniqueConstraint, PrimaryKeyConstraint


class UserData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    email: Optional['str'] = Field(default=None, unique=True)
    password: str
    name: str
    age: int


class requestUserData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    email: Optional['str'] = Field(default=None, unique=True)
    password: str
    name: str
    age: int


class WritingData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    option: int  # 0: None, 1: 분류
    version: int
    writer: str
    path: str
    text: str
    recent_edit: str  # recent edited date



class ArchiveWriting(SQLModel, table=False):  # 아직 미구현
    __table_args__ = (
        UniqueConstraint('id', 'path', name="unique_id_by_path"),
        PrimaryKeyConstraint('id', 'path', name="unique_id_by_path")
    )

    id: Optional['int'] = Field(default=None)
    option: int  # 0: None, 1: 분류
    now_id: int  # 연결될 글의 아이디 ( 현재 존재하는 글 id )
    version: int
    writer: str
    path: str
    text: str
    creation: str


class sessionEmail(SQLModel, table=True):
    request_id: int = Field(primary_key=True, unique=True)
    auth_key: int
    creation: int
