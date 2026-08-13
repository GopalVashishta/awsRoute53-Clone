from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from app.models.dns_record import DnsRecord
from app.schemas.dns_record import RecordCreate, RecordUpdate
from app.services.hosted_zone_service import get_zone
from app.core.exceptions import RecordNotFound, InvalidRecordType, DuplicateRecord, InvalidInput
from sqlalchemy.exc import IntegrityError
from app.utils.bind_parser import parse_bind_zone, export_bind_zone

VALID_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}

def _ensure_trailing_dot(name: str) -> str:
    return name if name.endswith(".") else f"{name}."

def create_record(db: Session, user_id: str, zone_id: str, data: RecordCreate):
    zone = get_zone(db, user_id, zone_id)
    
    if data.type not in VALID_TYPES:
        raise InvalidRecordType(f"Invalid record type: {data.type}")
        
    name = _ensure_trailing_dot(data.name)
    if not name.endswith(zone.name):
        raise InvalidInput(f"Record name {name} must end with zone name {zone.name}")
        
    now = datetime.now(timezone.utc).isoformat()
    record = DnsRecord(
        id=str(uuid.uuid4()),
        hosted_zone_id=zone_id,
        name=name,
        type=data.type,
        ttl=data.ttl,
        value=data.value,
        created_at=now,
        updated_at=now
    )
    
    try:
        db.add(record)
        zone.record_set_count += 1
        db.commit()
        db.refresh(record)
        return record
    except IntegrityError:
        db.rollback()
        raise DuplicateRecord("Record already exists")

def list_records(db: Session, user_id: str, zone_id: str, search: str = None, type_filter: str = None, page: int = 1, page_size: int = 20):
    get_zone(db, user_id, zone_id)
    
    query = db.query(DnsRecord).filter(DnsRecord.hosted_zone_id == zone_id)
    if search:
        query = query.filter(DnsRecord.name.ilike(f"%{search}%"))
    if type_filter:
        query = query.filter(DnsRecord.type == type_filter)
        
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return items, total

def get_record(db: Session, user_id: str, zone_id: str, record_id: str):
    get_zone(db, user_id, zone_id)
    record = db.query(DnsRecord).filter(DnsRecord.id == record_id, DnsRecord.hosted_zone_id == zone_id).first()
    if not record:
        raise RecordNotFound()
    return record

def update_record(db: Session, user_id: str, zone_id: str, record_id: str, data: RecordUpdate):
    record = get_record(db, user_id, zone_id, record_id)
    
    if data.type is not None:
        if data.type not in VALID_TYPES:
            raise InvalidRecordType(f"Invalid record type: {data.type}")
        record.type = data.type
        
    if data.name is not None:
        zone = get_zone(db, user_id, zone_id)
        name = _ensure_trailing_dot(data.name)
        if not name.endswith(zone.name):
            raise InvalidInput(f"Record name {name} must end with zone name {zone.name}")
        record.name = name
        
    if data.ttl is not None:
        record.ttl = data.ttl
    if data.value is not None:
        record.value = data.value
        
    record.updated_at = datetime.now(timezone.utc).isoformat()
    try:
        db.commit()
        db.refresh(record)
        return record
    except IntegrityError:
        db.rollback()
        raise DuplicateRecord("Record with this name and type already exists")

def delete_record(db: Session, user_id: str, zone_id: str, record_id: str):
    record = get_record(db, user_id, zone_id, record_id)
    zone = get_zone(db, user_id, zone_id)
    
    if record.type in ["NS", "SOA"] and record.name == zone.name:
        raise InvalidInput("Cannot delete default NS or SOA records")
        
    db.delete(record)
    zone.record_set_count -= 1
    db.commit()

def import_bind_records(db: Session, user_id: str, zone_id: str, zone_content: str):
    zone = get_zone(db, user_id, zone_id)
    parsed = parse_bind_zone(zone_content, default_origin=zone.name)
    
    created_count = 0
    now = datetime.now(timezone.utc).isoformat()
    
    for item in parsed:
        rec_name = _ensure_trailing_dot(item["name"])
        if not rec_name.endswith(zone.name):
            rec_name = f"{rec_name.rstrip('.')}." if rec_name.endswith(".") else f"{rec_name}.{zone.name}"

        existing = db.query(DnsRecord).filter(
            DnsRecord.hosted_zone_id == zone_id,
            DnsRecord.name == rec_name,
            DnsRecord.type == item["type"]
        ).first()
        
        if existing:
            existing.ttl = item["ttl"]
            existing.value = item["value"]
            existing.updated_at = now
        else:
            new_rec = DnsRecord(
                id=str(uuid.uuid4()),
                hosted_zone_id=zone_id,
                name=rec_name,
                type=item["type"],
                ttl=item["ttl"],
                value=item["value"],
                routing_policy="Simple",
                created_at=now,
                updated_at=now
            )
            db.add(new_rec)
            zone.record_set_count += 1
            created_count += 1

    db.commit()
    return {"message": f"Successfully imported records", "parsed_count": len(parsed), "created_count": created_count}

def export_zone_records(db: Session, user_id: str, zone_id: str, format_type: str = "bind"):
    zone = get_zone(db, user_id, zone_id)
    records = db.query(DnsRecord).filter(DnsRecord.hosted_zone_id == zone_id).all()
    
    if format_type.lower() == "json":
        return {
            "zone": {
                "id": zone.id,
                "name": zone.name,
                "comment": zone.comment,
                "is_private_zone": bool(zone.is_private_zone),
            },
            "records": [
                {
                    "id": r.id,
                    "name": r.name,
                    "type": r.type,
                    "ttl": r.ttl,
                    "value": r.value,
                    "routing_policy": r.routing_policy
                }
                for r in records
            ]
        }
        return export_bind_zone(zone.name, records)

def bulk_delete_records(db: Session, user_id: str, zone_id: str, record_ids: list) -> dict:
    zone = get_zone(db, user_id, zone_id)
    deleted = 0
    skipped = []
    
    for record_id in record_ids:
        record = db.query(DnsRecord).filter(
            DnsRecord.id == record_id,
            DnsRecord.hosted_zone_id == zone_id
        ).first()
        if not record:
            skipped.append({"id": record_id, "reason": "Not found"})
            continue
        if record.type in ["NS", "SOA"] and record.name == zone.name:
            skipped.append({"id": record_id, "reason": "Cannot delete default NS/SOA records"})
            continue
        db.delete(record)
        zone.record_set_count = max(0, zone.record_set_count - 1)
        deleted += 1
    
    db.commit()
    return {"deleted": deleted, "skipped": skipped, "message": f"Deleted {deleted} record(s)"}
