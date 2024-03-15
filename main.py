from fastapi import FastAPI, Request

from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse


import os

from db.db import create_db_and_tables, engine

from sqlmodel import Session, select

from model.model import *
from db.db import engine

app = FastAPI()

###### router sync start ########
for file in os.listdir("./router"):
    if len(file) >= 4:
        if file[-3:] == ".py":
            if file[0] == "#":
                continue

            exec(f"from router import {file[:-3]}\n"
                 f"app.include_router({file[:-3]}.router)", globals())
##### router sync finished ######

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

templates = Jinja2Templates(directory="templates")
templates.env.globals["STATIC_URL"] = "/static"


# @app.get("/")
# async def main(request: Request):
#     return {"message": "Hello!"}

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", context={"request": request})

@app.api_route("/{path_name:path}", methods=["GET"])  # 위키 글 화면
async def write_output_likewiki(request: Request, path_name: str):
    with Session(engine) as session:
        statement = select(WritingData).where(WritingData.path == path_name)
        result = session.exec(statement).first()

    if result is None:
        return {"success": False}

    return {"success": True, "data": result}


if __name__ == "__main__":
    create_db_and_tables()  # Create tables that written in "./model/~1"

# uvicorn main:app --reload
