from pydantic import BaseModel
from typing import Optional

class ZoneCreate(BaseModel):
    name: str
    comment: Optional[str] = None
    is_private_zone: bool = False

class ZoneUpdate(BaseModel):
    comment: Optional[str] = None
    is_private_zone: Optional[bool] = None

class ZoneResponse(BaseModel):
    id: str
    name: str
    comment: Optional[str] = None
    is_private_zone: bool
    record_set_count: int
    user_id: str
    created_at: str
    updated_at: str
