from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.hosted_zone import ZoneCreate, ZoneUpdate, ZoneResponse
from app.schemas.common import PaginatedResponse
from app.services import hosted_zone_service
from app.api.deps import get_db, get_current_user
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])

def _to_response(zone):
    return ZoneResponse(
        id=zone.id,
        name=zone.name,
        comment=zone.comment,
        is_private_zone=bool(zone.is_private_zone),
        record_set_count=zone.record_set_count,
        user_id=zone.user_id,
        created_at=zone.created_at,
        updated_at=zone.updated_at
    )

@router.get("", response_model=PaginatedResponse[ZoneResponse])
def list_zones(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total = hosted_zone_service.list_zones(db, current_user.id, search, page, page_size)
    return PaginatedResponse(
        items=[_to_response(z) for z in items],
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("", response_model=ZoneResponse)
def create_zone(
    data: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zone_service.create_zone(db, current_user.id, data)
    return _to_response(zone)

@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zone_service.get_zone(db, current_user.id, zone_id)
    return _to_response(zone)

@router.put("/{zone_id}", response_model=ZoneResponse)
def update_zone(
    zone_id: str,
    data: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zone_service.update_zone(db, current_user.id, zone_id, data)
    return _to_response(zone)

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hosted_zone_service.delete_zone(db, current_user.id, zone_id)
    return {"message": "Zone deleted"}
