from typing import Optional

from sqlmodel import Field, Relationship, SQLModel, JSON, Column
from sqlmodel import UniqueConstraint, PrimaryKeyConstraint


class UserData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    authority: int  # 1: 관리자 / 2: 부관리자 / 3: 일반인
    email: Optional['str'] = Field(default=None, unique=True)
    password: str
    name: str
    age: int  # 출생 년도


class requestUserData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    email: Optional['str'] = Field(default=None, unique=True)
    password: str
    name: str
    age: int


class WritingData(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    authority: int  # NNN 형식, 리눅스처럼 읽기/쓰기 순으로 333(관리자,조금 강한 유저,유저).
    option: int  # 0: None, 1: 분류
    category: str
    version: int
    writer: str
    path: str = Field(unique=True)  # ~/~/~
    content: str
    recent_edit: str  # recent edited date


class ArchiveWriting(SQLModel, table=True):  # 아직 미구현
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    real_id: int
    authority: int
    category: str
    option: int  # 0: None, 1: 분류
    now_id: int  # 연결될 글의 아이디 ( 현재 존재하는 글 id )
    version: int
    writer: str
    path: str
    content: str
    recent_edit: str
    message: str


class HiddenWriting(SQLModel, table=True):
    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    authority: int  # NNN 형식, 리눅스처럼 읽기/쓰기 순으로 333(관리자,조금 강한 유저,유저).
    option: int  # 0: None, 1: 분류
    category: str
    version: int
    writer: str
    path: str = Field(unique=True)  # ~/~/~
    content: str
    recent_edit: str  # recent edited date


class HiddenArchiveWriting(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("path", "version", name="hiddenarchivewriting_unique"),
    )

    id: Optional['int'] = Field(default=None, primary_key=True, unique=True)
    real_id: int
    authority: int  # NNN 형식, 리눅스처럼 읽기/쓰기 순으로 333(관리자,조금 강한 유저,유저).
    option: int  # 0: None, 1: 분류
    category: str
    version: int
    writer: str
    path: str  # ~/~/~
    content: str
    recent_edit: str  # recent edited date


class sessionEmail(SQLModel, table=True):
    request_id: int = Field(primary_key=True, unique=True)
    email: str = Field(unique=True)
    auth_key: int
    creation: int
