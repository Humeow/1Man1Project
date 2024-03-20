from fastapi import APIRouter, Request, Form, Response, Cookie
from sqlmodel import Session, select

import glovar
from model.model import *
from db.db import engine

router = APIRouter()


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  <- 얘 못 쓰겠음


# @router.post("/user/input")
# async def user_input(request: Request, user_data: UserData):
#     with Session(engine) as session:
#         session.add(user_data)
#         session.commit()
#         session.refresh(user_data)
#
#     return {"success": True}
#
#
# @router.post("/user/output")
# async def user_output(request: Request, user_name: str):
#     with Session(engine) as session:
#         statement = select(UserData).where(UserData.name == user_name)
#         result = session.exec(statement).first()
#
#     if result is None:
#         return {"success": False}
#
#     return {"success": True, "data": result}

@router.post("/login")
async def user_login(request: Request, response: Response, email: str = Form(), password: str = Form()):
    with Session(engine) as session:
        statement = select(UserData).where(UserData.email == email)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False, 'msg': 'no_user'}

    if result.password == password:
        access_token = glovar.tokenizer.create_access_token(email)
        refresh_token = glovar.tokenizer.create_refresh_token(email)

        response.set_cookie(key='access', value=access_token[0], expires=access_token[1])  # httponly = ?
        response.set_cookie(key='refresh', value=refresh_token[0], expires=refresh_token[1])

        return {"success": True, 'access': access_token[0], 'refresh': refresh_token[0]}

    else:
        return {"success": False, 'msg': 'pwd_fail'}


@router.post("/refresh")
async def user_token_refresh(request: Request, response: Response, refresh: Optional[str] = Cookie(None)):
    access_token = glovar.tokenizer.use_refresh_token(refresh)  # TODO: refresh token으로 access 갱신 만들기

    if access_token['success']:
        response.set_cookie(key='access', value=access_token['access'][0], expires=access_token['access'][1])
        return {'success': True}

    return {'success': False, 'msg': access_token['msg']}


@router.post("/logout")
async def user_logout(request: Request, response: Response):
    response.delete_cookie(key='refresh')
    response.delete_cookie(key='access')
    return {'success': True}  # TODO: 토큰 쿠키 삭제, 로그아웃


@router.post("/register")  # needs op's allowance
async def user_register(request: Request, response: Response, user_data: requestUserData):
    with Session(engine) as session:
        session.add(user_data)
        session.commit()
        session.refresh(user_data)

    return {"success": True}
