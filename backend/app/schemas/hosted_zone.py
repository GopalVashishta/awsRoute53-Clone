from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional

class ZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Domain name for the hosted zone")
    comment: Optional[str] = Field(default=None, max_length=255, description="Optional description")
    is_private_zone: bool = Field(default=False, description="Whether this is a private hosted zone")

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Domain name cannot be empty")
        return v

class ZoneUpdate(BaseModel):
    comment: Optional[str] = Field(default=None, max_length=255)
    is_private_zone: Optional[bool] = None

class ZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    comment: Optional[str] = None
    is_private_zone: bool
    record_set_count: int
    user_id: str
    created_at: str
    updated_at: str

    @field_validator("is_private_zone", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        return bool(v)
