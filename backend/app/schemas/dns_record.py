from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional

VALID_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}

class RecordCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Fully qualified domain name or relative prefix")
    type: str = Field(..., description="DNS record type (e.g. A, CNAME, TXT)")
    ttl: int = Field(default=300, ge=1, le=2147483647, description="Time-to-Live in seconds")
    value: str = Field(..., min_length=1, description="Record value / routing target")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_upper = v.strip().upper()
        if v_upper not in VALID_TYPES:
            raise ValueError(f"Invalid record type '{v}'. Allowed types: {', '.join(sorted(VALID_TYPES))}")
        return v_upper

class RecordUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    type: Optional[str] = None
    ttl: Optional[int] = Field(default=None, ge=1, le=2147483647)
    value: Optional[str] = Field(default=None, min_length=1)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v_upper = v.strip().upper()
        if v_upper not in VALID_TYPES:
            raise ValueError(f"Invalid record type '{v}'. Allowed types: {', '.join(sorted(VALID_TYPES))}")
        return v_upper

class RecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str = "Simple"
    created_at: str
    updated_at: str
