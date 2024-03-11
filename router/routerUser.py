from fastapi import APIRouter, Request, Form
from sqlmodel import Session, select

from model.model import *
from db.db import engine

router = APIRouter()

@router.post("/user/input")
async def user_input(request: Request, user_data: UserData):
    with Session(engine) as session:
        session.add(user_data)
        session.commit()
        session.refresh(user_data)

    return {"success": True}


@router.post("/user/output")
async def user_output(request: Request, user_name: str):
    with Session(engine) as session:
        statement = select(UserData).where(UserData.name == user_name)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False}

    return {"success": True, "data": result}