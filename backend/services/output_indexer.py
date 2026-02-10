"""Extract ranked entities from model output text."""

from __future__ import annotations

import re

MAX_ENTITIES = 10
NUMBERED_CONFIDENCE = 0.95
BULLET_CONFIDENCE = 0.75
FREE_TEXT_CONFIDENCE = 0.55

_NUMBERED_PATTERN = re.compile(
    r"^\s*(\d{1,2})[\.\)]\s+(.+?)\s*$",
    re.MULTILINE,
)
_BULLET_PATTERN = re.compile(
    r"^\s*[-*•]\s+(.+?)\s*$",
    re.MULTILINE,
)
_SPLIT_CLEANUP = re.compile(r"\s*\((.*?)\)\s*")
_SEPARATOR_PATTERN = re.compile(r"\s*(?:[-:|]|,|–|—)\s*")
_FREE_TEXT_ENTITY_PATTERN = re.compile(
    r"\b([A-ZÆØÅ][\wÆØÅæøå]+(?:\s+[A-ZÆØÅ][\wÆØÅæøå]+){0,3})\b"
)


def index_output_entities(platform: str, response_text: str) -> list[dict]:
    """Build rank-index rows for extracted entities in output text."""
    text = (response_text or "").strip()
    if not text:
        return []

    ranked_entities = _extract_ranked_entities(text)
    if ranked_entities:
        return _build_index(platform, ranked_entities, NUMBERED_CONFIDENCE)

    bullet_entities = _extract_bullet_entities(text)
    if bullet_entities:
        ranked = [
            {"entity": entity, "position": idx + 1}
            for idx, entity in enumerate(bullet_entities)
        ]
        return _build_index(platform, ranked, BULLET_CONFIDENCE)

    free_entities = _extract_free_text_entities(text)
    ranked = [
        {"entity": entity, "position": idx + 1}
        for idx, entity in enumerate(free_entities)
    ]
    return _build_index(platform, ranked, FREE_TEXT_CONFIDENCE)


def _extract_ranked_entities(text: str) -> list[dict]:
    entities: list[dict] = []
    seen: set[str] = set()
    for match in _NUMBERED_PATTERN.finditer(text):
        position = int(match.group(1))
        entity = _extract_entity_name(match.group(2))
        if not entity:
            continue
        key = _normalize_entity(entity)
        if not key or key in seen:
            continue
        seen.add(key)
        entities.append({"entity": entity, "position": position})
        if len(entities) >= MAX_ENTITIES:
            break
    return entities


def _extract_bullet_entities(text: str) -> list[str]:
    entities: list[str] = []
    seen: set[str] = set()
    for match in _BULLET_PATTERN.finditer(text):
        entity = _extract_entity_name(match.group(1))
        if not entity:
            continue
        key = _normalize_entity(entity)
        if not key or key in seen:
            continue
        seen.add(key)
        entities.append(entity)
        if len(entities) >= MAX_ENTITIES:
            break
    return entities


def _extract_free_text_entities(text: str) -> list[str]:
    entities: list[str] = []
    seen: set[str] = set()

    for match in _FREE_TEXT_ENTITY_PATTERN.finditer(text):
        entity = _extract_entity_name(match.group(1))
        if not entity:
            continue
        if entity.lower() in {"chatgpt", "perplexity", "norge"}:
            continue
        key = _normalize_entity(entity)
        if not key or key in seen:
            continue
        seen.add(key)
        entities.append(entity)
        if len(entities) >= MAX_ENTITIES:
            break

    return entities


def _extract_entity_name(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        return ""
    text = _SPLIT_CLEANUP.sub("", text)
    text = _SEPARATOR_PATTERN.split(text)[0].strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) < 2:
        return ""
    return text


def _normalize_entity(entity: str) -> str:
    return re.sub(r"\s+", " ", (entity or "").lower()).strip()


def _build_index(platform: str, ranked_entities: list[dict], confidence: float) -> list[dict]:
    rows: list[dict] = []
    for row in ranked_entities[:MAX_ENTITIES]:
        rows.append(
            {
                "platform": platform,
                "entity": row["entity"],
                "position": row.get("position"),
                "mention_type": "mention",
                "sentiment": "neutral",
                "confidence": confidence,
            }
        )
    return rows
