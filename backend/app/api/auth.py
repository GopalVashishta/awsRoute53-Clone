from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, UserResponse, MeResponse
from app.services import auth_service
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    token, user = auth_service.login(db, data.email, data.password)
    response.set_cookie(key="session_id", value=token, httponly=True, samesite="lax", path="/")
    return UserResponse(id=user.id, email=user.email, display_name=user.display_name, created_at=user.created_at)

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if session_id:
        auth_service.logout(db, session_id)
    response.delete_cookie("session_id")
    return {"message": "Logged out"}

@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse(id=current_user.id, email=current_user.email, display_name=current_user.display_name, created_at=current_user.created_at)
    return MeResponse(user=user_resp)
