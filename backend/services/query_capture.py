"""Exact query capture service for prompt-like searches."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from models.schemas import (
    EntityIndexItem,
    ModelOutput,
    Platform,
    QueryCaptureRequest,
    QueryCaptureResult,
)
from services.openai_service import OPENAI_MODEL, query_chatgpt
from services.output_indexer import index_output_entities
from services.perplexity_service import PERPLEXITY_MODEL, query_perplexity


async def run_query_capture(request: QueryCaptureRequest) -> QueryCaptureResult:
    """Capture exact user query outputs and rank-index extracted entities."""
    query = request.query.strip()
    if not query:
        raise ValueError("Oppgi en spørring for query capture.")

    selected_platforms = _dedupe_platforms(request.platforms)
    if not selected_platforms:
        selected_platforms = [Platform.CHATGPT, Platform.PERPLEXITY]

    output_payloads = await asyncio.gather(
        *[_query_platform(platform, query) for platform in selected_platforms]
    )
    outputs = [ModelOutput(**payload) for payload in output_payloads]

    indexed_rows: list[EntityIndexItem] = []
    for output in outputs:
        if not output.raw_output:
            continue
        rows = index_output_entities(output.platform, output.raw_output)
        indexed_rows.extend(EntityIndexItem(**row) for row in rows)

    run_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    query_normalized = _normalize_query(query)
    summary = _build_summary(query, outputs, indexed_rows)

    return QueryCaptureResult(
        query=query,
        query_normalized=query_normalized,
        run_id=run_id,
        created_at=created_at,
        outputs=outputs,
        entity_index=indexed_rows,
        summary=summary,
    )


async def _query_platform(platform: Platform, query: str) -> dict:
    if platform == Platform.CHATGPT:
        result = await query_chatgpt(query)
        model = result.get("model") or OPENAI_MODEL
    elif platform == Platform.PERPLEXITY:
        result = await query_perplexity(query)
        model = result.get("model") or PERPLEXITY_MODEL
    else:
        raise ValueError(f"Ugyldig plattform: {platform}")

    raw_output = result.get("response", "")
    return {
        "platform": platform,
        "model": model,
        "query": query,
        "raw_output": raw_output,
        "snippet": _build_snippet(raw_output),
        "citations": result.get("citations") or [],
        "error": result.get("error"),
    }


def _dedupe_platforms(platforms: list[Platform]) -> list[Platform]:
    deduped: list[Platform] = []
    seen: set[Platform] = set()
    for platform in platforms:
        if platform in seen:
            continue
        seen.add(platform)
        deduped.append(platform)
    return deduped


def _build_snippet(text: str, max_len: int = 320) -> str:
    compact = " ".join((text or "").split())
    if len(compact) <= max_len:
        return compact
    return compact[:max_len].rstrip() + "..."


def _normalize_query(query: str) -> str:
    return " ".join(query.lower().split())


def _build_summary(
    query: str, outputs: list[ModelOutput], index_rows: list[EntityIndexItem]
) -> str:
    successful = [o for o in outputs if not o.error and o.raw_output]
    unique_entities = list(dict.fromkeys(row.entity for row in index_rows))

    if not successful:
        return (
            f"Spørringen «{query}» ble sendt, men ingen plattform returnerte et gyldig svar."
        )

    top_entities = (
        ", ".join(unique_entities[:3]) if unique_entities else "ingen tydelige aktører"
    )
    return (
        f"Spørringen «{query}» ble kjørt i {len(successful)} av {len(outputs)} plattformer. "
        f"Fant {len(unique_entities)} indekserte aktører, inkludert {top_entities}."
    )
