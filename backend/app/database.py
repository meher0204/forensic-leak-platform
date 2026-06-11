from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = "sqlite:///./database.sqlite3"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 5},
    # SQLite serialises concurrent writes; pool_pre_ping verifies
    # connections before using them to avoid stale connections.
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError:
        db.rollback()
        raise
    finally:
        db.close()
