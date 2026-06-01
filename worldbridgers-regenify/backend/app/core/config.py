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
    allow_degraded_db_startup: bool = False

    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    neo4j_trust_all: bool = False
    jwt_secret: str
    session_max_age_hours: int = 12
    remember_session_days: int = 30
    password_reset_token_hours: int = 2
    login_rate_limit_attempts: int = 10
    login_rate_limit_window_seconds: int = 900
    register_rate_limit_attempts: int = 5
    register_rate_limit_window_seconds: int = 3600
    forgot_password_rate_limit_attempts: int = 5
    forgot_password_rate_limit_window_seconds: int = 900
    public_form_rate_limit_attempts: int = 10
    public_form_rate_limit_window_seconds: int = 3600
    frontend_base_url: str = "http://localhost:3000"
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_from_name: str = "Worldbridgers Regenify"
    smtp_starttls: bool = True
    smtp_use_ssl: bool = False
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = None
    s3_documents_bucket: Optional[str] = None
    s3_documents_prefix: str = "documents"
    s3_presigned_url_expires_seconds: int = 900
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
        if self.password_reset_token_hours <= 0:
            raise ValueError("PASSWORD_RESET_TOKEN_HOURS must be greater than 0.")
        if self.login_rate_limit_attempts <= 0 or self.login_rate_limit_window_seconds <= 0:
            raise ValueError("Login rate limit settings must be greater than 0.")
        if self.register_rate_limit_attempts <= 0 or self.register_rate_limit_window_seconds <= 0:
            raise ValueError("Register rate limit settings must be greater than 0.")
        if self.forgot_password_rate_limit_attempts <= 0 or self.forgot_password_rate_limit_window_seconds <= 0:
            raise ValueError("Forgot-password rate limit settings must be greater than 0.")
        if self.public_form_rate_limit_attempts <= 0 or self.public_form_rate_limit_window_seconds <= 0:
            raise ValueError("Public form rate limit settings must be greater than 0.")
        if self.smtp_port <= 0:
            raise ValueError("SMTP_PORT must be greater than 0.")
        if self.smtp_use_ssl and self.smtp_starttls:
            raise ValueError("SMTP_USE_SSL and SMTP_STARTTLS cannot both be enabled.")
        if self.s3_presigned_url_expires_seconds <= 0:
            raise ValueError("S3_PRESIGNED_URL_EXPIRES_SECONDS must be greater than 0.")

    @property
    def smtp_enabled(self) -> bool:
        return bool(self.smtp_host and self.smtp_from_email)

    @property
    def s3_documents_enabled(self) -> bool:
        return bool(
            self.aws_access_key_id
            and self.aws_secret_access_key
            and self.aws_region
            and self.s3_documents_bucket
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
