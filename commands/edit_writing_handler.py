from model.model import *
from db.db import engine
from sqlmodel import Session
from sqlmodel import select

from datetime import datetime

from commands.writeauth_handler import write_auth


class classEditWriting:
    async def edit_with_archive(self, writing_model: WritingData, user: UserData, message):
        """
        :param writing_model: path, content
        :param user: email
        :return:
        """
        with Session(engine) as session:
            statement = select(UserData).where(UserData.email == user.email)
            results = session.exec(statement)
            user_data = results.first()

            statement = select(WritingData).where(WritingData.path == writing_model.path)
            results = session.exec(statement)
            writing_data = results.first()

            if writing_data is None:
                statement = select(MainWriting).where(WritingData.path == writing_model.path)
                results = session.exec(statement)
                writing_data = results.first()

                if writing_data is None:
                    return {'success': False, 'msg': 'no_writing'}

                if not write_auth.is_writable(user_data.authority, writing_data.authority):  # = 해당 유저가 그 글에 쓰기 권한이 없는 지
                    return {'success': False, 'msg': 'no_authority'}

                archive_writing = ArchiveMainWriting(
                    path=writing_data.path,
                    authority=writing_data.authority,
                    option=writing_data.option,
                    category=writing_data.category,
                    now_id=writing_data.id,
                    version=writing_data.version,
                    writer=writing_data.writer,
                    content=writing_data.content,
                    recent_edit=writing_data.recent_edit,
                    message=message,
                )

            else:
                if not write_auth.is_writable(user_data.authority, writing_data.authority):  # = 해당 유저가 그 글에 쓰기 권한이 없는 지
                    return {'success': False, 'msg': 'no_authority'}

                archive_writing = ArchiveWriting(
                    authority=writing_data.authority,
                    option=writing_data.option,
                    category=writing_data.category,
                    now_id=writing_data.id,
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
