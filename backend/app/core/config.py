from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./route53.db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
