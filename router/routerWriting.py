from fastapi import APIRouter, Request, Response, Form, Cookie
from sqlmodel import Session, select

from model.model import *
from db.db import engine

from commands.auth_handler import *

router = APIRouter()

@router.post("/write/input")
async def write_input(request: Request, response: Response, writing_data: WritingData, access: Optional[str] = Cookie(None)):
    from datetime import datetime
    """
    :param writing_data:
        Need param: path(~/~/~), text
    """

    is_vaild = await user_check(access)
    if not is_vaild['success']:
        return is_vaild


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


@router.api_route("/w/{path_name:path}", methods=["GET"])  # 위키 글 화면
async def write_output_likewiki(request: Request, path_name: str):
    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path_name)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False}

    return {"success": True, "data": result}