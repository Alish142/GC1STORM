from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Worldbridgers Regenify API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    postgres_dsn: str = "postgresql+psycopg://postgres:postgres@localhost:5432/regenify"

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password123"
    jwt_secret: str = "local-dev-jwt-secret"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
