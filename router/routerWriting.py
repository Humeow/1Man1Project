from fastapi import APIRouter, Request, Form
from sqlmodel import Session, select

from model.model import *
from db.db import engine

router = APIRouter()

@router.post("/write/input")
async def write_input(request: Request, writing_data: WritingData):
    from datetime import datetime
    """
    :param writing_data:
        Need param: path(~/~/~), text
    """

    if writing_data.id is not None:
        del writing_data.id

    now = datetime.now()
    writing_data.recent_edit = now.strftime('%Y%m%d%H%M%S')

    with Session(engine) as session:
        session.add(writing_data)
        session.commit()
        session.refresh(writing_data)

    return {"success": True}


@router.post("/write/output")
async def write_output(request: Request, path_name: str):
    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path_name)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False}

    return {"success": True, "data": result}
