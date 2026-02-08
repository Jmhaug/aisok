"""Supabase client for storing analyses and enforcing free limits."""

from supabase import create_client
from config import settings

_client = None


def get_client():
    global _client
    if _client is None and settings.supabase_url and settings.supabase_key:
        _client = create_client(settings.supabase_url, settings.supabase_key)
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
