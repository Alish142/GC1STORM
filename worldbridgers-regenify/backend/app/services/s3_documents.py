from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import boto3
from botocore.client import BaseClient

from app.core.config import get_settings


@dataclass(frozen=True)
class UploadedDocument:
    storage_ref: str
    object_key: str
    size_bytes: int


def _get_settings():
    return get_settings()


def s3_documents_enabled() -> bool:
    return _get_settings().s3_documents_enabled


def _get_s3_client() -> BaseClient:
    settings = _get_settings()
    if not settings.s3_documents_enabled:
        raise RuntimeError("S3 document storage is not configured.")

    return boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def _normalize_prefix(prefix: str) -> str:
    trimmed = prefix.strip().strip("/")
    return trimmed


def build_document_object_key(filename: str) -> str:
    settings = _get_settings()
    safe_name = Path(filename).name or "document"
    prefix = _normalize_prefix(settings.s3_documents_prefix)
    key = f"{uuid4()}-{safe_name}"
    return f"{prefix}/{key}" if prefix else key


def upload_document_bytes(*, filename: str, content: bytes, content_type: str | None = None) -> UploadedDocument:
    settings = _get_settings()
    client = _get_s3_client()
    object_key = build_document_object_key(filename)
    extra_args: dict[str, str] = {}
    if content_type:
        extra_args["ContentType"] = content_type

    client.put_object(
        Bucket=settings.s3_documents_bucket,
        Key=object_key,
        Body=content,
        **extra_args,
    )
    return UploadedDocument(
        storage_ref=f"s3://{settings.s3_documents_bucket}/{object_key}",
        object_key=object_key,
        size_bytes=len(content),
    )


def _parse_storage_ref(storage_ref: str) -> tuple[str, str] | None:
    if storage_ref.startswith("s3://"):
        bucket_and_key = storage_ref[5:]
        if "/" not in bucket_and_key:
            return None
        bucket, key = bucket_and_key.split("/", 1)
        if not bucket or not key:
            return None
        return bucket, key

    if storage_ref.startswith("http://") or storage_ref.startswith("https://"):
        return None

    settings = _get_settings()
    if settings.s3_documents_bucket:
        return settings.s3_documents_bucket, storage_ref.lstrip("/")
    return None


def resolve_document_url(storage_ref: str | None) -> str | None:
    if not storage_ref:
        return None
    if storage_ref.startswith("http://") or storage_ref.startswith("https://"):
        return storage_ref

    parsed = _parse_storage_ref(storage_ref)
    if not parsed or not s3_documents_enabled():
        return None

    bucket, key = parsed
    client = _get_s3_client()
    settings = _get_settings()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=settings.s3_presigned_url_expires_seconds,
    )
