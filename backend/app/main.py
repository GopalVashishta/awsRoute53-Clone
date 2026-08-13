from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.engine import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_database
from app.core.exceptions import AppError
from app.core.config import settings

from app.api import auth, hosted_zones, dns_records

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Invalid request data") if errors else "Invalid request data"
    loc = errors[0].get("loc", ()) if errors else ()
    code = "INVALID_RECORD_TYPE" if "type" in loc else "INVALID_INPUT"
    if msg.startswith("Value error, "):
        msg = msg[len("Value error, "):]
    return JSONResponse(
        status_code=400,
        content={"error": {"code": code, "message": msg}}
    )

app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(dns_records.router)
