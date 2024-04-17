from fastapi import APIRouter, Request, Form, Response, Cookie, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlmodel import Session, select

from model.model import *
from db.db import engine

from commands.mail_handler import mail_author
from commands.jwt_handler import tokenizer
from commands.hash_handler import hasher

from typing import Annotated

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

# @router.post("/login")
# async def user_login(request: Request, response: Response, email: str = Form(), password: str = Form()):
#     with Session(engine) as session:
#         statement = select(UserData).where(UserData.email == email)
#         result = session.exec(statement).first()
#
#     if result is None:
#         return {"success": False, 'msg': 'no_user'}
#
#     if result.password == password:
#         access_token = glovar.tokenizer.create_access_token(email)
#         refresh_token = glovar.tokenizer.create_refresh_token(email)
#
#         response.set_cookie(key='access', value=access_token[0], expires=access_token[1])  # httponly = ?
#         response.set_cookie(key='refresh', value=refresh_token[0], expires=refresh_token[1])
#
#         return {"success": True, 'access': access_token[0], 'refresh': refresh_token[0]}
#
#     else:
#         return {"success": False, 'msg': 'pwd_fail'}

@router.post("/login", tags=['email, password'])
# async def user_login(request: Request, response: Response, email: str = Form(), password: str = Form()):  # TODO: HTTPS ssl 적용
async def user_login(request: Request, response: Response, user: UserData):  # TODO: HTTPS ssl 적용
    # email = 'coodi60419@gmail.com'
    # password = 'baka'

    email = user.email
    password = user.password

    with Session(engine) as session:
        statement = select(UserData).where(UserData.email == email)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False, 'msg': 'no_user'}

    if hasher.hash_compare(password, result.password):
        access_token = tokenizer.create_access_token(email)
        refresh_token = tokenizer.create_refresh_token(email)

        redirect = RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)

        redirect.set_cookie(key='access', value=access_token[0], expires=access_token[1])  # httponly = ?
        redirect.set_cookie(key='refresh', value=refresh_token[0], expires=refresh_token[1])

        return redirect

    else:

        return {"success": False, 'msg': 'pwd_fail'}


@router.post("/refresh")
async def user_token_refresh(request: Request, response: Response, refresh: Optional[str] = Cookie(None)):
    access_token = tokenizer.use_refresh_token(refresh)

    if access_token['success']:
        response.set_cookie(key='access', value=access_token['access'][0], expires=access_token['access'][1])
        return {'success': True}

    return {'success': False, 'msg': access_token['msg']}


@router.post("/logout")
async def user_logout(request: Request, response: Response):
    response.delete_cookie(key='refresh')
    response.delete_cookie(key='access')
    return {'success': True}


@router.post("/register_request")  # needs op's allowance
async def user_register_code(request: Request, response: Response, email: str):
    request_id = await mail_author.request(email)
    return request_id


@router.post("/register")
async def user_register(request: Request, response: Response, request_id: int, auth_key: int,
                        user_data: requestUserData):
    result = await mail_author.auth(request_id, auth_key)

    if not result['success']:
        return result

    requestUserData.password = hasher.hash_make(requestUserData.password)

    with Session(engine) as session:
        session.add(user_data)
        session.commit()
        session.refresh(user_data)

    return {"success": True}

# @router.post("/hash")  # TEMPORARY
# async def hash_router(request: Request, response: Response, text: str):
#     return hasher.hash_make(text)

# @router.post("/checktoken")  # TEMPORARY
# async def check_token(request: Request, response: Response, token: str):
#     return tokenizer.validate_token(token)['success']
