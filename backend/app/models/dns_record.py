from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint, Index, CheckConstraint
from app.db.base import Base

class DnsRecord(Base):
    __tablename__ = "dns_records"
    
    id = Column(String, primary_key=True)
    hosted_zone_id = Column(String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    ttl = Column(Integer, default=300)
    value = Column(String, nullable=False)
    routing_policy = Column(String, default="Simple")
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

    __table_args__ = (
        CheckConstraint("type IN ('A','AAAA','CNAME','TXT','MX','NS','PTR','SRV','CAA','SOA')"),
        UniqueConstraint("hosted_zone_id", "name", "type", name="uq_zone_name_type"),
        Index("ix_dns_records_hosted_zone_id", "hosted_zone_id"),
        Index("ix_dns_records_name", "name"),
        Index("ix_dns_records_type", "type"),
    )
