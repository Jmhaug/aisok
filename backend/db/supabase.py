"""Supabase client for storing analyses and onboarding monitoring payloads."""

from supabase import create_client
from config import settings

_client = None


def get_client():
    global _client
    if _client is None and settings.supabase_url and settings.supabase_key:
        try:
            _client = create_client(settings.supabase_url, settings.supabase_key)
        except Exception:
            # Invalid or placeholder credentials — skip Supabase (dev mode)
            return None
    return _client


async def check_free_limit(email: str) -> bool:
    """Check if this email has already used their free analysis."""
    client = get_client()
    if not client:
        # No Supabase configured — allow (dev mode)
        return True

    result = (
        client.table("free_analyses")
        .select("id")
        .eq("email", email.lower())
        .execute()
    )
    return len(result.data) < settings.free_analysis_limit


async def store_analysis(email: str, result: dict) -> None:
    """Store a completed analysis in Supabase."""
    client = get_client()
    if not client:
        return

    client.table("free_analyses").insert(
        {
            "email": email.lower(),
            "brand_name": result.get("brand_name", ""),
            "domain": result.get("domain", ""),
            "visibility_score": result.get("visibility_score", 0),
            "total_mentions": result.get("total_mentions", 0),
            "total_citations": result.get("total_citations", 0),
            "result_json": result,
        }
    ).execute()


async def store_query_capture(
    email: str, result: dict, metadata: dict | None = None
) -> None:
    """Store exact-query capture runs in Supabase."""
    client = get_client()
    if not client:
        return

    outputs = result.get("outputs") or []
    if not outputs:
        return

    query = result.get("query", "")
    query_normalized = result.get("query_normalized") or _normalize_query(query)
    created_at = result.get("created_at")
    email_normalized = email.lower()
    metadata = metadata or {}

    platform_index: dict[str, list[dict]] = {}
    for row in result.get("entity_index") or []:
        platform = row.get("platform")
        if not platform:
            continue
        platform_index.setdefault(platform, []).append(row)

    for output in outputs:
        platform = output.get("platform", "")
        payload = {
            "email": email_normalized,
            "query": query,
            "query_normalized": query_normalized,
            "platform": platform,
            "model": output.get("model", ""),
            "raw_output": output.get("raw_output", ""),
            "citations_json": output.get("citations") or [],
            "entity_index_json": platform_index.get(platform, []),
            "created_at": created_at,
            "config_id": metadata.get("config_id"),
            "job_id": metadata.get("job_id"),
            "query_category": metadata.get("query_category"),
            "scope_level": metadata.get("scope_level"),
        }
        try:
            client.table("query_runs").insert(payload).execute()
        except Exception:
            # Keep API responses resilient when optional table/indexes are missing.
            continue


async def store_monitoring_config(email: str, payload: dict) -> str | None:
    """Store onboarding monitoring configuration and return persisted config id."""
    client = get_client()
    if not client:
        return None

    data = {
        "id": payload.get("id"),
        "email": email.lower(),
        "profile_json": payload.get("profile_json", {}),
        "competitors_json": payload.get("competitors_json", []),
        "queries_json": payload.get("queries_json", []),
        "platforms_json": payload.get("platforms_json", []),
        "scope_level": payload.get("scope_level"),
        "created_at": payload.get("created_at"),
    }
    try:
        resp = client.table("monitoring_configs").insert(data).execute()
        rows = resp.data or []
        if rows and isinstance(rows[0], dict):
            return rows[0].get("id")
    except Exception:
        return None
    return None


async def store_monitoring_job(payload: dict) -> None:
    """Store monitoring job status updates when the optional table exists."""
    client = get_client()
    if not client:
        return

    try:
        client.table("monitoring_jobs").upsert(payload, on_conflict="job_id").execute()
    except Exception:
        try:
            client.table("monitoring_jobs").insert(payload).execute()
        except Exception:
            # Optional persistence should never break runtime flow.
            return


def _normalize_query(query: str) -> str:
    return " ".join((query or "").lower().split())
