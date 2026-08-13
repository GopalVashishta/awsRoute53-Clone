from sqlalchemy import Column, String, Integer, ForeignKey, Index
from app.db.base import Base

class HostedZone(Base):
    __tablename__ = "hosted_zones"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    comment = Column(String)
    is_private_zone = Column(Integer, default=0)
    record_set_count = Column(Integer, default=2)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    __table_args__ = (
        Index("ix_hosted_zones_user_id", "user_id"),
        Index("ix_hosted_zones_name", "name"),
    )
