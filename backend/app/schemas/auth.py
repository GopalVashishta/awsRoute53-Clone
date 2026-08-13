from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    created_at: str

class MeResponse(BaseModel):
    user: UserResponse
    account_id: str = "123456789012"
    arn: str = "arn:aws:iam::123456789012:root"
    org: str = "o-exampleorg"
