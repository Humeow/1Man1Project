from fastapi import APIRouter, Request, Response, Form, Cookie, status
from sqlmodel import Session, select
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse

from commands.edit_writing_handler import writingEdit
from commands.writeauth_handler import write_auth
from model.model import *
from db.db import engine

from commands.auth_handler import *

import json
import os
import copy

router = APIRouter()

templates = Jinja2Templates(directory="templates")
templates.env.globals["STATIC_URL"] = "/static"

min_user_auth = int(os.environ.get('USERAUTH_HIDDEN_MINIMUM', '-1'))
everyone_auth = int(os.environ.get('USERAUTH_ACCESS_EVERYONE', '9999'))

with open('./db/fail_text.txt', 'r') as f:
    fail_text = '\n'.join(f.readlines())
no_page_access_text = {  # 만약 없는 페이지일 때 보여줄 문서
    'authority': 333,
    'option': 0,
    'category': '',
    'version': 0,
    'writer': '',
    'content': fail_text,
    'recent_edit': '',
}

# @router.post("/write/main")
# async def main_write_output(request: Request, response: Response, hb: bool = False,
#                             access: Optional[str] = Cookie(None), refresh: Optional[str] = Cookie(None)):
#     if hb:
#         is_access_valid = tokenizer.validate_token(access, refresh)
#
#         if not is_access_valid['success']:
#             return {'success': False}
#
#         if is_access_valid['is_refreshed']:
#             response.set_cookie(key='access', value=is_access_valid['new_access'][0],
#                                 expires=is_access_valid['new_access'][1])
#
#         user_auth = write_auth.getUserAuth(is_access_valid['data']['email'])
#
#         if user_auth <= min_user_auth:
#             with Session(engine) as session:
#                 statement = select(HiddenMainWriting)
#                 result = session.exec(statement).first()
#
#             return {'success': True, 'data': result}
#
#     with Session(engine) as session:
#         statement = select(MainWriting)
#         result = session.exec(statement).first()
#
#     return {'success': True, 'data': result}


# @router.post("/write/input")
# async def write_input(request: Request, response: Response, writing_data: WritingData,
#                       access: Optional[str] = Cookie(None)):
#     from datetime import datetime
#     """
#     :param writing_data:
#         Need param: path(~/~/~), text
#     """
#
#     is_vaild = await user_check(access)
#     if not is_vaild['success']:
#         return is_vaild
#
#     if writing_data.id is not None:
#         del writing_data.id
#
#     now = datetime.now()
#     writing_data.recent_edit = now.strftime('%Y%m%d%H%M%S')
#
#     with Session(engine) as session:
#         session.add(writing_data)
#         session.commit()
#         session.refresh(writing_data)
#
#     return {"success": True}


@router.post("/write/output", tags=['path', 'hb'])
async def write_output(request: Request, response: Response, path: str, hb: bool = False,
                       access: Optional[str] = Cookie(None), refresh: Optional[str] = Cookie(None)):
    path = path.strip()
    if path == 'undefined':
        path = '웹플위키-대문'

    fail_data = copy.deepcopy(no_page_access_text)
    fail_data['content'] = fail_data['content'].replace('[[새문서]]', f'[[L:/edit/{path}|새 문서 작성하기]]')

    is_access_valid = tokenizer.validate_token(access, refresh)

    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path)
        writing_data = session.exec(statement).first()

        if not is_access_valid['success']:
            if write_auth.is_readable(everyone_auth, writing_data.authority):
                writing_data = writing_data.__dict__
                del writing_data['_sa_instance_state']
                ans = {'success': True, 'data': writing_data}

                return ans

            return {'success': False, 'data': fail_data}

        if is_access_valid['is_refreshed']:
            response.set_cookie(key='access', value=is_access_valid['new_access'][0],
                                expires=is_access_valid['new_access'][1])

        statement = select(UserData).where(UserData.email == is_access_valid['token']['sub'])
        user_data = session.exec(statement).first()

        if hb:
            user_auth = write_auth.getUserAuth(is_access_valid['token']['sub'])

            if user_auth <= min_user_auth:
                statement = select(HiddenWriting).where(HiddenWriting.path == path)
                writing_data = session.exec(statement).first()
            else:
                pass

        else:
            pass

        if writing_data is None:
            return {'success': False, 'data': fail_data}

        if not write_auth.is_readable(user_data.authority, writing_data.authority):
            return {'success': False, 'data': fail_data}

        writing_data = writing_data.__dict__
        del writing_data['_sa_instance_state']
        ans = {'success': True, 'data': writing_data}

        return ans


@router.post("/write/edit_archive")
async def write_edit_archive(request: Request, response: Response, edit_writing: ArchiveWriting, hb: bool = False,
                             access: Optional[str] = Cookie(None), refresh: Optional[str] = Cookie(None)):
    """
    :param edit_writing: content, message
    """

    is_access_valid = tokenizer.validate_token(access, refresh)

    if not is_access_valid['success']:
        return {'success': False}

    # response = RedirectResponse(url="/w/" + edit_writing.path, status_code=status.HTTP_302_FOUND)

    if is_access_valid['is_refreshed']:
        response.set_cookie(key='access', value=is_access_valid['new_access'][0],
                            expires=is_access_valid['new_access'][1])

    writing_data = WritingData(path=edit_writing.path, content=edit_writing.content,)

    user_data = UserData(email=is_access_valid['token']['sub'])

    result = await writingEdit.edit_with_archive(writing_data, user_data, edit_writing.message, hb)

    if result['success']:
        return {'success': True}
    else:
        return {'success': False}


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


@router.api_route("/edit/{path_name:path}", methods=["GET"])
def index(request: Request, path_name: str):
    return templates.TemplateResponse("edit.html", context={"request": request})
