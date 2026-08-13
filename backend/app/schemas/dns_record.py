from pydantic import BaseModel
from typing import Optional

class RecordCreate(BaseModel):
    name: str
    type: str
    ttl: int = 300
    value: str

class RecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    ttl: Optional[int] = None
    value: Optional[str] = None

class RecordResponse(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    created_at: str
    updated_at: str
