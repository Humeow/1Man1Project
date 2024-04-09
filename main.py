from fastapi import FastAPI, Request

from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from dotenv import load_dotenv
import os
import random

from db.db import create_db_and_tables, engine

from sqlmodel import Session, select

from model.model import *
from db.db import engine
from commands.jwt_handler import classTokenizer
from commands.mail_handler import MailAuth

import glovar

load_dotenv()

if os.environ.get('IS_DEVELOP'):
    app = FastAPI()
else:
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# app = FastAPI(docs_url='/coodi/api/docs', redoc_url='/coodi/api/redoc', openapi_url='/coodi/api/openapi')

origins = ["http://localhost:8000",
           "http://127.0.0.1:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = os.path.dirname(os.path.realpath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

templates = Jinja2Templates(directory="templates")
templates.env.globals["STATIC_URL"] = "/static"

glovar.tokenizer = classTokenizer()

# @app.get("/")
# async def main(request: Request):
#     return {"message": "Hello!"}


@app.get("/", response_class=HTMLResponse)  # TODO: 서버 DB랑 연결할 수 있게
def index(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@app.get("/login", response_class=HTMLResponse)  # TODO: 서버 DB랑 연결할 수 있게
def index(request: Request):
    return templates.TemplateResponse("login.html", context={"request": request})


#===== router sync start =====#
for file in os.listdir("./router"):
    if len(file) >= 4:
        if file[-3:] == ".py":
            if file[0] == "#":
                continue

            exec(f"from router import {file[:-3]}\n"
                 f"app.include_router({file[:-3]}.router)", globals())
#===== router sync finished =====#


if __name__ == "__main__":
    create_db_and_tables()  # Create tables that written in "./model/~1"

# uvicorn main:app --reload

