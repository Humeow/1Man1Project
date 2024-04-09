from fastapi import APIRouter, Request, Response, Form, Cookie
from sqlmodel import Session, select

from model.model import *
from db.db import engine

from commands.auth_handler import *

router = APIRouter()


@router.get("/api/post/{pk}", tags=['pk'])
async def write_input(request: Request, response: Response, pk: int):
    return {"data": pk}
