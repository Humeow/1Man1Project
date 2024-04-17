from fastapi import APIRouter, Request, Response, Form, Cookie, status
from sqlmodel import Session, select
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse

from commands.edit_writing_handler import writingEdit
from model.model import *
from db.db import engine

from commands.auth_handler import *

import json

router = APIRouter()

templates = Jinja2Templates(directory="templates")
templates.env.globals["STATIC_URL"] = "/static"


@router.post("/main")
async def main_write_output(request: Request, response: Response):
    with Session(engine) as session:
        statement = select(MainWriting)
        result = session.exec(statement).first()

    return {'success': True, 'data': result}


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
async def write_output(request: Request, path):
    path = path.strip()
    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path)
        result = session.exec(statement).first()



    if result is None:
        ans = {"success": False}
    else:
        result = result.__dict__
        del result['_sa_instance_state']
        ans = {'success': True, 'data': result}

    return json.dumps(ans, ensure_ascii=False)


@router.post("/write/edit_archive")
async def write_edit_archive(request: Request, edit_writing: WritingData):
    edit_writing.path = edit_writing.path.strip()

    # TODO: 이 전에 유저 확인
    result = writingEdit()

    redirect = RedirectResponse(url="/w/"+edit_writing.path, status_code=status.HTTP_302_FOUND)

    return redirect


@router.post("/write/is_exist")  # TODO: 여유 있으면..
async def write_is_exist(request: Request, path: str):
    path = path.strip()
    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path)
        result = session.exec(statement).first()

    if result is None:
        ans = {"success": False}
    else:
        ans = {'success': True}

    return json.dumps(ans, ensure_ascii=False)


@router.api_route("/w/{path_name:path}", methods=["GET"])  # 위키 글 화면
async def write_output_likewiki(request: Request, path_name: str):
    return templates.TemplateResponse("index.html", context={"request": request})
