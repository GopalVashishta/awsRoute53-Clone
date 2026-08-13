from sqlalchemy import Column, String, ForeignKey
from app.db.base import Base

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(String, nullable=False)
    expires_at = Column(String, nullable=False)
