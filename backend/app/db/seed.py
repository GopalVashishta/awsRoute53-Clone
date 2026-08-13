from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DnsRecord
from app.core.security import hash_password

def seed_database(db: Session):
    if db.query(User).first() is None:
        now = datetime.now(timezone.utc).isoformat()
        
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            display_name="Admin User",
            created_at=now,
            updated_at=now
        )
        db.add(user)
        db.flush()
        
        zone_id = "Z0123456789ABC"
        zone = HostedZone(
            id=zone_id,
            name="example.com.",
            comment="Default seed zone",
            is_private_zone=0,
            record_set_count=2,
            user_id=user_id,
            created_at=now,
            updated_at=now
        )
        db.add(zone)
        db.flush()
        
        ns_record = DnsRecord(
            id=str(uuid.uuid4()),
            hosted_zone_id=zone_id,
            name="example.com.",
            type="NS",
            ttl=172800,
            value="ns-001.awsdns-01.com.",
            created_at=now,
            updated_at=now
        )
        db.add(ns_record)
        
        soa_record = DnsRecord(
            id=str(uuid.uuid4()),
            hosted_zone_id=zone_id,
            name="example.com.",
            type="SOA",
            ttl=900,
            value="ns-001.awsdns-01.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
            created_at=now,
            updated_at=now
        )
        db.add(soa_record)
        
        db.commit()
