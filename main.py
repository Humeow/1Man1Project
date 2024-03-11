from fastapi import FastAPI, Request

from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi import status

import os

from db.db import create_db_and_tables, engine

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

@app.get("/")
async def main(request: Request):
    return {"message": "Hello!"}


if __name__ == "__main__":
    create_db_and_tables()  # Create tables that written in "./model/~1"

# uvicorn main:app --reload
