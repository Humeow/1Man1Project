from sqlmodel import Session, select
from model.model import *
from db.db import engine

from commands.auth_handler import *

class writeauth_class:
    def is_readable(self, userauth: int, writeauth: int):
        return int(str(writeauth)[userauth-1]) // 2

    def is_writable(self, userauth: int, writeauth: int):
        return int(str(writeauth)[userauth - 1]) % 2

    def getUserAuth(self, email: str):
        with Session(engine) as session:
            statement = select(UserData).where(UserData.email == email)
            result = session.exec(statement).first()

        return result.authority

write_auth = writeauth_class()
