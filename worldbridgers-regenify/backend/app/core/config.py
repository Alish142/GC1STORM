from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Worldbridgers Regenify API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    postgres_dsn: str

    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    neo4j_trust_all: bool = False
    jwt_secret: str
    session_max_age_hours: int = 12
    remember_session_days: int = 30
    bootstrap_admin_email: Optional[str] = None
    bootstrap_admin_password: Optional[str] = None
    bootstrap_admin_name: str = "Platform Admin"

    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    def model_post_init(self, __context) -> None:
        if self.jwt_secret.strip().lower() in {"local-dev-jwt-secret", "change-me", "changeme"}:
            raise ValueError("JWT_SECRET must be set to a strong, non-default value.")
        if self.session_max_age_hours <= 0:
            raise ValueError("SESSION_MAX_AGE_HOURS must be greater than 0.")
        if self.remember_session_days <= 0:
            raise ValueError("REMEMBER_SESSION_DAYS must be greater than 0.")


@lru_cache
def get_settings() -> Settings:
    return Settings()
