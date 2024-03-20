from fastapi import FastAPI, Request

from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from dotenv import load_dotenv
import os

from db.db import create_db_and_tables, engine

from sqlmodel import Session, select

from model.model import *
from db.db import engine
from commands.jwt_handler import classTokenizer

import glovar

load_dotenv()

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

templates = Jinja2Templates(directory="templates")
templates.env.globals["STATIC_URL"] = "/static"

glovar.tokenizer = classTokenizer()

# @app.get("/")
# async def main(request: Request):
#     return {"message": "Hello!"}

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})


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
