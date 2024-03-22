from sqlmodel import Session, select
from db.db import engine
from model.model import sessionEmail

from model.model import UserData
from commands.jwt_handler import tokenizer


async def user_check(access):
    with Session(engine) as session:
        validation = tokenizer.validate_token(access)
        if not validation['success']:
            return validation

        email = validation['token']['sub']

        statement = select(UserData).where(UserData.email == email)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False, 'msg': 'token_failed'}

    return {"success": True}
