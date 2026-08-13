from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.db.engine import get_db
from app.services.auth_service import get_current_user_from_session
from app.core.exceptions import Unauthorized

def get_current_user(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise Unauthorized("Not authenticated")
    return get_current_user_from_session(db, session_id)
