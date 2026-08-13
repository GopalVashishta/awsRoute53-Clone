from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Annotated
from app.schemas.hosted_zone import ZoneCreate, ZoneUpdate, ZoneResponse
from app.schemas.common import PaginatedResponse
from app.services import hosted_zone_service, dns_record_service
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])

class ImportBindRequest(BaseModel):
    content: str = Field(..., min_length=1, description="BIND 9 zone file text content")

@router.get("", response_model=PaginatedResponse[ZoneResponse])
def list_zones(
    search: Optional[str] = None,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items, total = hosted_zone_service.list_zones(db, current_user.id, search, page, page_size)
    return PaginatedResponse(
        items=[ZoneResponse.model_validate(z) for z in items],
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
    return ZoneResponse.model_validate(zone)

@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zone_service.get_zone(db, current_user.id, zone_id)
    return ZoneResponse.model_validate(zone)

@router.put("/{zone_id}", response_model=ZoneResponse)
def update_zone(
    zone_id: str,
    data: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zone_service.update_zone(db, current_user.id, zone_id, data)
    return ZoneResponse.model_validate(zone)

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hosted_zone_service.delete_zone(db, current_user.id, zone_id)
    return {"message": "Zone deleted"}

class BulkDeleteZonesRequest(BaseModel):
    zone_ids: list[str] = Field(..., min_length=1)

@router.delete("")
def bulk_delete_zones(
    body: BulkDeleteZonesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = hosted_zone_service.bulk_delete_zones(db, current_user.id, body.zone_ids)
    return result

@router.post("/{zone_id}/import")
def import_bind(
    zone_id: str,
    body: ImportBindRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_record_service.import_bind_records(db, current_user.id, zone_id, body.content)

@router.get("/{zone_id}/export")
def export_zone(
    zone_id: str,
    format: Annotated[str, Query(pattern="^(bind|json)$", description="Export format (bind or json)")] = "bind",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = dns_record_service.export_zone_records(db, current_user.id, zone_id, format)
    zone = hosted_zone_service.get_zone(db, current_user.id, zone_id)
    filename = zone.name.rstrip(".")
    
    if format == "json":
        return JSONResponse(
            content=result,
            headers={"Content-Disposition": f'attachment; filename="{filename}.json"'}
        )
    else:
        return PlainTextResponse(
            content=result,
            headers={"Content-Disposition": f'attachment; filename="{filename}.zone"'}
        )
