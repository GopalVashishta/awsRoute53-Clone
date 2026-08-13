from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.dns_record import RecordCreate, RecordUpdate, RecordResponse
from app.schemas.common import PaginatedResponse
from app.services import dns_record_service
from app.api.deps import get_db, get_current_user
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["dns-records"])

@router.get("", response_model=PaginatedResponse[RecordResponse])
def list_records(
    zone_id: str,
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total = dns_record_service.list_records(db, current_user.id, zone_id, search, type, page, page_size)
    return PaginatedResponse(
        items=[RecordResponse(**r.__dict__) for r in items],
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("", response_model=RecordResponse)
def create_record(
    zone_id: str,
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = dns_record_service.create_record(db, current_user.id, zone_id, data)
    return RecordResponse(**record.__dict__)

@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = dns_record_service.get_record(db, current_user.id, zone_id, record_id)
    return RecordResponse(**record.__dict__)

@router.put("/{record_id}", response_model=RecordResponse)
def update_record(
    zone_id: str,
    record_id: str,
    data: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = dns_record_service.update_record(db, current_user.id, zone_id, record_id, data)
    return RecordResponse(**record.__dict__)

@router.delete("/{record_id}")
def delete_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dns_record_service.delete_record(db, current_user.id, zone_id, record_id)
    return {"message": "Record deleted"}
