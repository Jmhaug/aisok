"""Onboarding business profiling + suggestion generation."""

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urlparse

from openai import AsyncOpenAI

from config import settings
from models.schemas import BusinessProfile, CompetitorCandidate, SuggestedQuery

_CITY_REGION = {
    "bergen": "Vestland",
    "oslo": "Oslo",
    "trondheim": "Trondelag",
    "stavanger": "Rogaland",
    "tromso": "Troms",
    "kristiansand": "Agder",
}

_BANK_COMPETITORS = [
    ("DNB", "dnb.no"),
    ("Nordea Norge", "nordea.no"),
    ("SpareBank 1", "sparebank1.no"),
    ("Storebrand", "storebrand.no"),
    ("Handelsbanken Norge", "handelsbanken.no"),
    ("Sbanken", "sbanken.no"),
    ("KLP", "klp.no"),
    ("Danske Bank Norge", "danskebank.no"),
]

_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


async def infer_business_profile(raw_input: str, locale: str = "nb-NO") -> BusinessProfile:
    """Infer onboarding profile from user-provided business input."""
    del locale
    normalized = (raw_input or "").strip()
    if not normalized:
        raise ValueError("Mangler input for profilering.")

    profile = _fallback_business_profile(normalized)
    llm_profile = await _llm_business_profile(normalized)
    if llm_profile:
        profile = _merge_profile(profile, llm_profile)
    profile.scope_level = _infer_scope_level(profile.size_band, profile.city, profile.region)
    return profile


async def suggest_competitors(
    profile: BusinessProfile, limit: int = 8
) -> list[CompetitorCandidate]:
    """Suggest relevant competitors with geographic matching."""
    candidates = _fallback_competitors(profile, limit=limit)
    llm_candidates = await _llm_competitors(profile, limit=limit)
    if llm_candidates:
        candidates = _merge_competitors(
            profile.business_name, llm_candidates + candidates, limit=limit
        )
    else:
        candidates = _merge_competitors(profile.business_name, candidates, limit=limit)
    return candidates


async def suggest_queries(
    profile: BusinessProfile,
    competitors: list[CompetitorCandidate],
    limit: int = 12,
) -> list[SuggestedQuery]:
    """Suggest high-signal monitoring queries from profile + competitors."""
    suggestions = _fallback_queries(profile, competitors, limit=limit)
    llm_suggestions = await _llm_queries(profile, competitors, limit=limit)
    if llm_suggestions:
        suggestions = _merge_queries(llm_suggestions + suggestions, limit=limit)
    else:
        suggestions = _merge_queries(suggestions, limit=limit)
    return _enforce_query_scope_rules(profile, suggestions)


def _fallback_business_profile(raw_input: str) -> BusinessProfile:
    text = raw_input.strip()
    lower = text.lower()
    website = _coerce_url(text)
    business_name = _name_from_input(text)
    city = None
    region = None
    for city_key, region_name in _CITY_REGION.items():
        if city_key in lower:
            city = city_key.capitalize()
            region = region_name
            break

    industry = _guess_industry(text)
    size_band = _guess_size_band(text, industry, city)
    confidence = 0.64

    return BusinessProfile(
        business_name=business_name,
        industry=industry,
        size_band=size_band,
        country="NO",
        region=region,
        city=city,
        website=website,
        scope_level=_infer_scope_level(size_band, city, region),
        confidence=confidence,
    )


def _fallback_competitors(
    profile: BusinessProfile, limit: int
) -> list[CompetitorCandidate]:
    business_name = profile.business_name.strip()
    scope = profile.scope_level
    city = profile.city or ""
    industry = (profile.industry or "").lower()

    if "bank" in industry or any(
        token in business_name.lower() for token in ("dnb", "nordea", "sparebank", "bank")
    ):
        rows: list[CompetitorCandidate] = []
        for idx, (name, domain) in enumerate(_BANK_COMPETITORS):
            if _normalize_name(name) == _normalize_name(business_name):
                continue
            rows.append(
                CompetitorCandidate(
                    name=name,
                    domain=domain,
                    scope_match="country",
                    relevance_score=max(0.5, 0.95 - idx * 0.05),
                    reason="Etablert konkurrent i norsk bankmarked",
                )
            )
            if len(rows) >= limit:
                break
        return rows

    if "bike" in industry or "sykkel" in business_name.lower():
        local_city = city or "Norge"
        generated = [
            (f"{local_city} Sykkelverksted", None),
            (f"{local_city} Bike Shop", None),
            (f"{local_city} Sykler", None),
            (f"Sykkelhuset {local_city}", None),
            (f"Pedal & Co {local_city}", None),
            (f"BySykkel {local_city}", None),
            (f"Sykkeleksperten {local_city}", None),
            (f"Ciclo {local_city}", None),
        ]
        rows = []
        for idx, (name, domain) in enumerate(generated):
            rows.append(
                CompetitorCandidate(
                    name=name,
                    domain=domain,
                    scope_match="city" if scope == "city" else "country",
                    relevance_score=max(0.55, 0.9 - idx * 0.04),
                    reason="Lokal sykkelforhandler med overlappende kundebehov",
                )
            )
            if len(rows) >= limit:
                break
        return rows

    templates = [
        f"{business_name} Alternativ",
        f"{business_name} Pro",
        f"{business_name} Norge",
        f"Beste {profile.industry} i {profile.country}",
        f"{business_name} Rival",
        f"Nordic {profile.industry}",
        f"{profile.industry} Partner",
        f"{business_name} Konkurrent",
    ]
    rows = []
    for idx, name in enumerate(templates):
        if _normalize_name(name) == _normalize_name(business_name):
            continue
        rows.append(
            CompetitorCandidate(
                name=name,
                domain=None,
                scope_match=scope,
                relevance_score=max(0.45, 0.84 - idx * 0.05),
                reason="Foreslått basert på bransje- og markedsnærhet",
            )
        )
        if len(rows) >= limit:
            break
    return rows


def _fallback_queries(
    profile: BusinessProfile, competitors: list[CompetitorCandidate], limit: int
) -> list[SuggestedQuery]:
    business = profile.business_name
    city = profile.city or "Norge"
    country = profile.country or "Norge"
    scope = profile.scope_level
    competitor_names = [c.name for c in competitors[:3]]
    competitor_phrase = ", ".join(competitor_names) if competitor_names else "konkurrenter"

    base: list[SuggestedQuery] = [
        SuggestedQuery(
            text=f"Hva er beste alternativ til {business}?",
            category="comparison",
            priority=1,
            scope_tags=[scope],
        ),
        SuggestedQuery(
            text=f"Sammenlign {business} med {competitor_phrase}",
            category="comparison",
            priority=2,
            scope_tags=[scope, "competitor"],
        ),
        SuggestedQuery(
            text=f"{business} anmeldelser og erfaringer",
            category="reviews",
            priority=3,
            scope_tags=[scope],
        ),
        SuggestedQuery(
            text=f"Hva tilbyr {business} i {country}?",
            category="services",
            priority=4,
            scope_tags=["country"],
        ),
        SuggestedQuery(
            text=f"Anbefal {profile.industry} i {country}",
            category="discovery",
            priority=5,
            scope_tags=["country"],
        ),
    ]

    if scope == "city":
        local_queries = [
            SuggestedQuery(
                text=f"beste {profile.industry} i {city}",
                category="local_discovery",
                priority=1,
                scope_tags=["city"],
            ),
            SuggestedQuery(
                text=f"{business} vs andre {profile.industry} i {city}",
                category="local_comparison",
                priority=2,
                scope_tags=["city", "competitor"],
            ),
            SuggestedQuery(
                text=f"hvilke {profile.industry} anbefales i {city}",
                category="local_discovery",
                priority=3,
                scope_tags=["city"],
            ),
            SuggestedQuery(
                text=f"rimeligste {profile.industry} i {city}",
                category="local_intent",
                priority=6,
                scope_tags=["city"],
            ),
        ]
        base = local_queries + base
    else:
        national = [
            SuggestedQuery(
                text=f"de største {profile.industry} i Norge",
                category="national_discovery",
                priority=1,
                scope_tags=["country"],
            ),
            SuggestedQuery(
                text=f"{business} markedsposisjon i Norge",
                category="national_comparison",
                priority=2,
                scope_tags=["country"],
            ),
            SuggestedQuery(
                text=f"sammenlign norske {profile.industry}",
                category="national_comparison",
                priority=3,
                scope_tags=["country", "competitor"],
            ),
        ]
        base = national + base

    merged = _merge_queries(base, limit=limit)
    return merged


def _enforce_query_scope_rules(
    profile: BusinessProfile, queries: list[SuggestedQuery]
) -> list[SuggestedQuery]:
    scope = profile.scope_level
    city = (profile.city or "").strip()
    normalized_city = city.lower()

    if scope == "city" and normalized_city:
        city_count = sum(1 for item in queries if normalized_city in item.text.lower())
        if city_count < 3:
            needed = 3 - city_count
            for idx in range(needed):
                queries.append(
                    SuggestedQuery(
                        text=f"beste {profile.industry} i {city} {idx + 1}",
                        category="local_discovery",
                        priority=10 + idx,
                        scope_tags=["city"],
                    )
                )

    if scope != "city":
        has_national = any("norge" in item.text.lower() for item in queries)
        if not has_national:
            queries.append(
                SuggestedQuery(
                    text=f"sammenlign {profile.industry} i Norge",
                    category="national_comparison",
                    priority=10,
                    scope_tags=["country"],
                )
            )

    return _merge_queries(queries, limit=12)


async def _llm_business_profile(raw_input: str) -> BusinessProfile | None:
    prompt = (
        "Du er en norsk B2B onboarding-assistent. "
        "Returner KUN gyldig JSON med feltene: "
        "business_name, industry, size_band, country, region, city, website, scope_level, confidence. "
        "Bruk scope_level en av: city, region, country. "
        f"Input: {raw_input}"
    )
    payload = await _llm_json(prompt)
    if not payload:
        return None
    try:
        return BusinessProfile(**payload)
    except Exception:
        return None


async def _llm_competitors(
    profile: BusinessProfile, limit: int
) -> list[CompetitorCandidate]:
    prompt = (
        "Du foreslår konkurrenter for overvaking av AI-synlighet. "
        "Returner KUN JSON-listen competitors med objekter: "
        "name, domain, scope_match, relevance_score, reason. "
        f"Business profile: {profile.model_dump_json()}. "
        f"Maks {limit} forslag."
    )
    payload = await _llm_json(prompt)
    if not payload:
        return []
    rows = payload.get("competitors") if isinstance(payload, dict) else payload
    if not isinstance(rows, list):
        return []
    parsed: list[CompetitorCandidate] = []
    for row in rows:
        try:
            parsed.append(CompetitorCandidate(**row))
        except Exception:
            continue
        if len(parsed) >= limit:
            break
    return parsed


async def _llm_queries(
    profile: BusinessProfile,
    competitors: list[CompetitorCandidate],
    limit: int,
) -> list[SuggestedQuery]:
    prompt = (
        "Du lager relevante overvakings-sporringer for konkurranseanalyse. "
        "Returner KUN JSON-listen suggested_queries med objekter: "
        "text, category, priority, scope_tags. "
        f"Business profile: {profile.model_dump_json()}. "
        f"Competitors: {[row.model_dump() for row in competitors[:6]]}. "
        f"Maks {limit} forslag."
    )
    payload = await _llm_json(prompt)
    if not payload:
        return []
    rows = payload.get("suggested_queries") if isinstance(payload, dict) else payload
    if not isinstance(rows, list):
        return []
    parsed: list[SuggestedQuery] = []
    for row in rows:
        try:
            parsed.append(SuggestedQuery(**row))
        except Exception:
            continue
        if len(parsed) >= limit:
            break
    return parsed


async def _llm_json(prompt: str) -> dict[str, Any] | list[Any] | None:
    if not _client:
        return None

    try:
        response = await _client.responses.create(
            model="gpt-4.1-mini",
            tools=[{"type": "web_search_preview"}],
            input=prompt,
        )
        text = (response.output_text or "").strip()
        if not text:
            return None
        return _parse_json(text)
    except Exception:
        return None


def _parse_json(raw: str) -> dict[str, Any] | list[Any] | None:
    text = raw.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except Exception:
        return None


def _merge_profile(base: BusinessProfile, incoming: BusinessProfile) -> BusinessProfile:
    payload = base.model_dump()
    incoming_data = incoming.model_dump()
    for key, value in incoming_data.items():
        if value is None or value == "":
            continue
        payload[key] = value
    payload["confidence"] = max(base.confidence, incoming.confidence)
    return BusinessProfile(**payload)


def _merge_competitors(
    business_name: str, rows: list[CompetitorCandidate], limit: int
) -> list[CompetitorCandidate]:
    deduped: list[CompetitorCandidate] = []
    seen: set[tuple[str, str]] = set()
    business_key = _normalize_name(business_name)

    for row in sorted(rows, key=lambda item: item.relevance_score, reverse=True):
        name_key = _normalize_name(row.name)
        domain_key = (row.domain or "").strip().lower()
        if not name_key:
            continue
        if name_key == business_key:
            continue
        token = (name_key, domain_key)
        if token in seen:
            continue
        seen.add(token)
        deduped.append(row)
        if len(deduped) >= limit:
            break
    return deduped


def _merge_queries(rows: list[SuggestedQuery], limit: int) -> list[SuggestedQuery]:
    deduped: list[SuggestedQuery] = []
    seen: set[str] = set()
    ordered = sorted(rows, key=lambda item: item.priority)
    for row in ordered:
        key = re.sub(r"\s+", " ", row.text.strip().lower())
        if not key or key in seen:
            continue
        seen.add(key)
        deduped.append(row)
        if len(deduped) >= limit:
            break
    for idx, row in enumerate(deduped):
        row.priority = idx + 1
    return deduped


def _guess_industry(text: str) -> str:
    lower = text.lower()
    keywords = {
        "banking": ["bank", "dnb", "nordea", "sparebank", "storebrand", "klp"],
        "bike_shop": ["sykkel", "bike", "cycling", "pedal"],
        "restaurant": ["restaurant", "cafe", "mat", "food"],
        "insurance": ["forsikring", "insurance"],
        "retail": ["butikk", "shop", "store"],
        "technology": ["saas", "software", "app", "tech", "it"],
    }
    for industry, tokens in keywords.items():
        if any(token in lower for token in tokens):
            return industry
    return "services"


def _guess_size_band(text: str, industry: str, city: str | None) -> str:
    lower = text.lower()
    if any(token in lower for token in ("asa", "group", "norge", "norway")):
        return "national"
    if industry == "banking":
        return "enterprise"
    if city:
        return "local"
    return "regional"


def _infer_scope_level(size_band: str, city: str | None, region: str | None) -> str:
    size = (size_band or "").lower()
    if size in {"local", "single-location"} and city:
        return "city"
    if size == "regional" and (region or city):
        return "region"
    return "country"


def _name_from_input(raw_input: str) -> str:
    stripped = raw_input.strip()
    if _looks_like_url(stripped):
        url = stripped if "://" in stripped else f"https://{stripped}"
        host = urlparse(url).netloc.lower().replace("www.", "")
        primary = host.split(".")[0]
        return primary.replace("-", " ").title()
    return re.sub(r"\s+", " ", stripped)


def _normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def _looks_like_url(value: str) -> bool:
    return bool(re.match(r"^(https?://)?[a-z0-9-]+\.[a-z]{2,}", value.lower()))


def _coerce_url(value: str) -> str | None:
    if not _looks_like_url(value):
        return None
    return value if value.startswith(("http://", "https://")) else f"https://{value}"
