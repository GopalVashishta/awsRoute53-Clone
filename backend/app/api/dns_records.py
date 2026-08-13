from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Annotated
from pydantic import BaseModel, Field
from app.schemas.dns_record import RecordCreate, RecordUpdate, RecordResponse
from app.schemas.common import PaginatedResponse
from app.services import dns_record_service
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/hosted-zones/{zone_id}/records", tags=["dns-records"])

@router.get("", response_model=PaginatedResponse[RecordResponse])
def list_records(
    zone_id: str,
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total = dns_record_service.list_records(db, current_user.id, zone_id, search, type, page, page_size)
    return PaginatedResponse(
        items=[RecordResponse.model_validate(r) for r in items],
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
    return RecordResponse.model_validate(record)

@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = dns_record_service.get_record(db, current_user.id, zone_id, record_id)
    return RecordResponse.model_validate(record)

@router.put("/{record_id}", response_model=RecordResponse)
def update_record(
    zone_id: str,
    record_id: str,
    data: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = dns_record_service.update_record(db, current_user.id, zone_id, record_id, data)
    return RecordResponse.model_validate(record)

@router.delete("/{record_id}")
def delete_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dns_record_service.delete_record(db, current_user.id, zone_id, record_id)
    return {"message": "Record deleted"}

class BulkDeleteRequest(BaseModel):
    record_ids: list[str] = Field(..., min_length=1, description="List of record IDs to delete")

@router.delete("")
def bulk_delete_records(
    zone_id: str,
    body: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = dns_record_service.bulk_delete_records(db, current_user.id, zone_id, body.record_ids)
    return result
