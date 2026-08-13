from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="Account password")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: str
    created_at: str

class MeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserResponse
    account_id: str = "123456789012"
    arn: str = "arn:aws:iam::123456789012:root"
    org: str = "o-exampleorg"
