from model.model import *
from db.db import engine
from sqlmodel import Session
from sqlmodel import select

from datetime import datetime

from commands.writeauth_handler import write_auth

hb_make_auth = 3300

class classEditWriting:
    async def edit_with_archive(self, writing_model: WritingData, user: UserData, message, hb: bool = False):
        """
        :param writing_model: path, content
        :param user: email
        :return:
        """
        with Session(engine) as session:
            statement = select(UserData).where(UserData.email == user.email)
            results = session.exec(statement)
            user_data = results.first()

            if user_data is None:
                return {'success': False, 'message': 'no_such_user'}

            if hb:
                if write_auth.is_readable(user_data.authority, hb_make_auth):
                    statement = select(HiddenWriting).where(HiddenWriting.path == writing_model.path)
                    results = session.exec(statement)
                else:
                    statement = select(WritingData).where(WritingData.path == writing_model.path)
                    results = session.exec(statement)

            else:
                statement = select(WritingData).where(WritingData.path == writing_model.path)
                results = session.exec(statement)

            writing_data = results.first()

            if writing_data is None:  # 이전 문서가 없을 때?
                now = datetime.now()

                insert_writing = WritingData(
                    authority=3330,  # TODO: 나중엔 authority 수정 할 수 있게 (관리자만)
                    option=1,
                    category='',
                    version=1,
                    writer=user_data.name,
                    path=writing_model.path,
                    content=writing_model.content,
                    recent_edit=now.strftime('%Y%m%d%H%M%S'),
                )
                if hb:
                    if write_auth.is_readable(user_data.authority, hb_make_auth):
                        insert_writing = HiddenWriting(
                            authority=3300,  # TODO: 나중엔 authority 수정 할 수 있게 (관리자만)
                            option=1,
                            category='',
                            version=1,
                            writer=user_data.name,
                            path=writing_model.path,
                            content=writing_model.content,
                            recent_edit=now.strftime('%Y%m%d%H%M%S'),
                        )

                session.add(insert_writing)
                session.commit()
                session.refresh(insert_writing)

                return {'success': True}

            if not write_auth.is_writable(user_data.authority, writing_data.authority):  # = 해당 유저가 그 글에 쓰기 권한이 없는 지
                return {'success': False, 'msg': 'no_authority'}

            if hb:
                archive_writing = HiddenArchiveWriting(
                    real_id=writing_data.id,
                    authority=writing_data.authority,
                    option=writing_data.option,
                    category=writing_data.category,
                    version=writing_data.version,
                    writer=writing_data.writer,
                    path=writing_data.path,
                    content=writing_data.content,
                    recent_edit=writing_data.recent_edit,
                    message=message,
                )

            else:
                archive_writing = ArchiveWriting(
                    real_id=writing_data.id,
                    now_id=,
                    authority=writing_data.authority,
                    option=writing_data.option,
                    category=writing_data.category,
                    version=writing_data.version,
                    writer=writing_data.writer,
                    path=writing_data.path,
                    content=writing_data.content,
                    recent_edit=writing_data.recent_edit,
                    message=message,
                )

            session.add(archive_writing)
            session.commit()
            session.refresh(archive_writing)

            now = datetime.now()

            writing_data.authority = writing_data.authority  # TODO: 나중엔 authority 수정 할 수 있게 (관리자만)
            writing_data.option = writing_data.option
            writing_data.category = writing_data.category
            writing_data.version += 1
            writing_data.writer = writing_data.writer
            writing_data.path = writing_model.path
            writing_data.content = writing_model.content
            writing_data.recent_edit = now.strftime('%Y%m%d%H%M%S')

            session.add(writing_data)
            session.commit()
            session.refresh(writing_data)

            return {"success": True}


writingEdit = classEditWriting()
