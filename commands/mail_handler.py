import smtplib
from email.mime.text import MIMEText

import bs4

from dotenv import load_dotenv
import os

from random import random
import time

from sqlmodel import Session, select
from db.db import engine
from model.model import sessionEmail

expiration_time = 60 * 5  # seconds


def new_id():
    id = int(str(round(time.time() % 1000)) + str(round((random() * 10000))))  # 현재 시간과 랜덤한 숫자르 조합하여 아이디 생성
    return id


class Mail:  # 메일 전송 클래스
    def __init__(self):
        self.mail = os.environ.get("MAILNAME")
        self.pwd = os.environ.get("MAILPWD")

        self.smtp = smtplib.SMTP('smtp.gmail.com', 587)  # smtp를 이용해서 로그인
        self.smtp.ehlo()
        self.smtp.starttls()
        self.smtp.login(self.mail, self.pwd)

    async def send(self, reception, **ctx):  # 메일 전송 함수
        msg = MIMEText(ctx["message"], ctx["type"])
        msg["subject"] = ctx["subject"]

        self.smtp.sendmail(self.mail, reception, msg.as_string())


class MailAuth(Mail):  # 메일 인증 클래스, 메일 클래스를 상속 받음
    def __init__(self):
        super().__init__()

    async def request(self, reception: str):  # 인증 요청
        auth_key = round(random() * 1000000)  # 랜덤한 6자리 숫자 생성
        super().__init__()  # 메일 로그인

        with Session(engine) as session:
            while True:
                request_id = new_id()  # 새 인증 아이디 생성

                statement = select(sessionEmail).where(sessionEmail.request_id == request_id)
                result = session.exec(statement).first()

                if result is None:
                    session.add(sessionEmail(request_id=request_id, auth_key=auth_key, creation=time.time()))
                    session.commit()
                    # session.refresh(sessionEmail)

                    break

        with open("templates/email_register.html", "r", encoding="utf-8") as html:  # 인증 메일 템플릿 불러오기
            message = html.read()

        soup = bs4.BeautifulSoup(message, "html.parser")  # 템플릿에 랜덤한 6자리 숫자 삽입
        code_box = soup.find("div", id="fd-code")
        p = soup.new_tag("p")
        p["style"] = "margin:auto;"
        p.string = f"{str(auth_key)[:3]} {str(auth_key)[3:]}"

        code_box.append(p)

        await self.send(reception, message=str(soup), subject="[웹플위키] 회원가입 인증코드", type="html")  # 메일 보내기

        return request_id

    async def auth(self, request_id, auth_key):  # 인증하기
        with Session(engine) as session:
            statement = select(sessionEmail).where(sessionEmail.request_id == request_id)
            result = session.exec(statement).first()

            if result is None:
                return {'success': False, 'msg': 'id_not_valid'}

            if result.auth_key == auth_key and result.creation + expiration_time > time.time():  # 만약 5분안에 인증 요청이 왔고 숫자가 일치한다면 True 반환
                session.delete(result)
                session.commit()
                return {'success': True}

            elif result.auth_key != auth_key:  # 인증 숫자가 일치하지 않는다면 False 반환
                return {'success': False, 'msg': 'incorrect_key'}

            elif result.expiration < time.time():  # 시간이 지났다면 False 반환
                session.delete(result)
                session.commit()
                return {'success': False, 'msg': 'time_out'}

            else:
                return False, "failed"


mail_author = MailAuth()
