from model.model import *
from db.db import engine
from sqlmodel import Session
from sqlmodel import select

from datetime import datetime


class classEditWriting:
    async def edit_with_archive(self, writing_model: WritingData):
        with Session(engine) as session:
            statement = select(WritingData).where(WritingData.path == writing_model.path)
            results = session.exec(statement)

            writing_data = results.first()

            if writing_data is None:
                statement = select(MainWriting).where(WritingData.path == writing_model.path)
                results = session.exec(statement)
                writing_data = results.first()

                if writing_data is None:
                    return {'success': False}

                archive_writing = ArchiveMainWriting(
                    path=writing_data.path,
                    authority=writing_data.authority,
                    option=writing_data.option,
                    category=writing_data.category,
                    version=writing_data.version,
                    writer=writing_data.writer,
                    content=writing_data.content,
                    recent_edit=writing_data.recent_edit,
                )

            else:
                archive_writing = ArchiveWriting(
                    authority=writing_data.authority,
                    option=writing_data.option,
                    now_id=writing_data.id,
                    version=writing_data.version,
                    writer=writing_data.writer,
                    path=writing_data.path,
                    content=writing_data.content,
                    recent_edit=writing_data.recent_edit,
                )

            session.add(archive_writing)
            session.commit()
            session.refresh(archive_writing)

            now = datetime.now()
            writing_data.recent_edit = now.strftime('%Y%m%d%H%M%S')
            writing_data.writer = writing_model.writer
            writing_data.path = writing_model.path
            writing_data.option = writing_model.option
            writing_data.content = writing_model.option
            writing_data.category = writing_model.option
            writing_data.authority = writing_model.option
            writing_data.version += 1

            session.add(writing_data)
            session.commit()
            session.refresh(writing_data)

            return {"success": True}




writingEdit = classEditWriting()
