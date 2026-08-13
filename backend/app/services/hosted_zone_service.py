from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DnsRecord
from app.schemas.hosted_zone import ZoneCreate, ZoneUpdate
from app.utils.id_generator import generate_zone_id
from app.core.exceptions import ZoneNotFound, DuplicateZone, ZoneNotEmpty, InvalidDomainName

def _ensure_trailing_dot(name: str) -> str:
    return name if name.endswith(".") else f"{name}."

def create_zone(db: Session, user_id: str, data: ZoneCreate):
    name = _ensure_trailing_dot(data.name)
    existing = db.query(HostedZone).filter(HostedZone.name == name).first()
    if existing:
        raise DuplicateZone(f"Zone {name} already exists")
    
    now = datetime.now(timezone.utc).isoformat()
    zone_id = generate_zone_id()
    
    zone = HostedZone(
        id=zone_id,
        name=name,
        comment=data.comment,
        is_private_zone=1 if data.is_private_zone else 0,
        record_set_count=2,
        user_id=user_id,
        created_at=now,
        updated_at=now
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    # Auto-create NS and SOA records
    ns_record = DnsRecord(
        id=str(uuid.uuid4()),
        hosted_zone_id=zone_id,
        name=name,
        type="NS",
        ttl=172800,
        value="ns-1.awsdns-01.com.\nns-2.awsdns-02.net.\nns-3.awsdns-03.org.\nns-4.awsdns-04.co.uk.",
        created_at=now,
        updated_at=now
    )
    soa_record = DnsRecord(
        id=str(uuid.uuid4()),
        hosted_zone_id=zone_id,
        name=name,
        type="SOA",
        ttl=900,
        value="ns-1.awsdns-01.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
        created_at=now,
        updated_at=now
    )
    db.add(ns_record)
    db.add(soa_record)
    db.commit()

    return zone

def list_zones(db: Session, user_id: str, search: str = None, page: int = 1, page_size: int = 20):
    query = db.query(HostedZone).filter(HostedZone.user_id == user_id)
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total

def get_zone(db: Session, user_id: str, zone_id: str):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id, HostedZone.user_id == user_id).first()
    if not zone:
        raise ZoneNotFound()
    return zone

def update_zone(db: Session, user_id: str, zone_id: str, data: ZoneUpdate):
    zone = get_zone(db, user_id, zone_id)
    if data.comment is not None:
        zone.comment = data.comment
    if data.is_private_zone is not None:
        zone.is_private_zone = 1 if data.is_private_zone else 0
    zone.updated_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    db.refresh(zone)
    return zone

def delete_zone(db: Session, user_id: str, zone_id: str):
    zone = get_zone(db, user_id, zone_id)
    
    non_default_records = db.query(DnsRecord).filter(
        DnsRecord.hosted_zone_id == zone_id,
        DnsRecord.type.notin_(["NS", "SOA"])
    ).count()
    
    if non_default_records > 0:
        raise ZoneNotEmpty("Cannot delete hosted zone with non-default records")
        
    db.query(DnsRecord).filter(DnsRecord.hosted_zone_id == zone_id).delete()
    db.delete(zone)
    db.commit()
