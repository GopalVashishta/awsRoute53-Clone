from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.models.session import Session as DbSession
from app.core.security import verify_password, generate_session_token
from app.core.exceptions import Unauthorized, SessionExpired

def login(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise Unauthorized("Invalid email or password")
    
    token = generate_session_token()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)
    
    db_session = DbSession(
        id=token,
        user_id=user.id,
        created_at=now.isoformat(),
        expires_at=expires_at.isoformat()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return token, user

def logout(db: Session, session_id: str):
    db_session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if db_session:
        db.delete(db_session)
        db.commit()

def get_current_user_from_session(db: Session, session_id: str):
    db_session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not db_session:
        raise Unauthorized("Invalid session")
    
    if datetime.fromisoformat(db_session.expires_at) < datetime.now(timezone.utc):
        db.delete(db_session)
        db.commit()
        raise SessionExpired()
    
    user = db.query(User).filter(User.id == db_session.user_id).first()
    if not user:
        raise Unauthorized("User not found")
    
    return user
