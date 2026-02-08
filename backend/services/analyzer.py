"""Main analysis orchestrator — coordinates scraping, querying, and scoring."""

import asyncio
from models.schemas import (
    AnalysisRequest,
    AnalysisResult,
    Mention,
    Platform,
    PlatformScore,
)
from services.scraper import extract_brand_from_url
from services.query_generator import generate_queries
from services.openai_service import batch_query as openai_batch
from services.perplexity_service import batch_query as perplexity_batch
from services.scoring import analyze_response, calculate_visibility_score


async def run_analysis(request: AnalysisRequest) -> AnalysisResult:
    """Run a full AI visibility analysis for a brand."""

    # Step 1: Determine brand info
    brand_name = request.brand_name or ""
    domain = ""
    description = ""

    if request.url:
        brand_info = await extract_brand_from_url(request.url)
        brand_name = brand_name or brand_info["brand_name"]
        domain = brand_info["domain"]
        description = brand_info.get("description", "")
    elif request.prompt and not brand_name:
        # Use the prompt as-is, try to extract brand name
        brand_name = request.prompt.strip()

    if not brand_name:
        raise ValueError("Kunne ikke bestemme merkevarenavn. Oppgi en URL eller merkevarenavn.")

    # Step 2: Generate queries
    queries = generate_queries(brand_name, domain, description)

    # Step 3: Query AI platforms in parallel
    openai_results, perplexity_results = await asyncio.gather(
        openai_batch(queries),
        perplexity_batch(queries),
    )

    # Step 4: Analyze responses
    all_mentions: list[Mention] = []
    chatgpt_analyses = []
    perplexity_analyses = []

    # Analyze ChatGPT responses
    for result in openai_results:
        if result.get("error") and not result.get("response"):
            continue
        analysis = analyze_response(result["response"], brand_name)
        chatgpt_analyses.append(analysis)
        all_mentions.append(
            Mention(
                platform=Platform.CHATGPT,
                query=result["query"],
                response_snippet=analysis["snippet"],
                mentioned=analysis["mentioned"],
                mention_type=analysis["mention_type"],
                sentiment=analysis["sentiment"],
                citation_url=analysis["citation_url"],
                position=analysis["position"],
            )
        )

    # Analyze Perplexity responses
    for result in perplexity_results:
        if result.get("error") and not result.get("response"):
            continue
        analysis = analyze_response(result["response"], brand_name)
        perplexity_analyses.append(analysis)
        all_mentions.append(
            Mention(
                platform=Platform.PERPLEXITY,
                query=result["query"],
                response_snippet=analysis["snippet"],
                mentioned=analysis["mentioned"],
                mention_type=analysis["mention_type"],
                sentiment=analysis["sentiment"],
                citation_url=analysis.get("citation_url") or _get_perplexity_citation(result, brand_name),
                position=analysis["position"],
            )
        )

    # Step 5: Calculate scores
    chatgpt_score = calculate_visibility_score(chatgpt_analyses)
    perplexity_score = calculate_visibility_score(perplexity_analyses)

    all_analyses = chatgpt_analyses + perplexity_analyses
    overall_score = calculate_visibility_score(all_analyses)

    # Build platform scores
    platform_scores = []

    if chatgpt_analyses:
        chatgpt_mentions = [a for a in chatgpt_analyses if a.get("mentioned")]
        chatgpt_citations = [a for a in chatgpt_analyses if a.get("citation_url")]
        platform_scores.append(
            PlatformScore(
                platform=Platform.CHATGPT,
                score=chatgpt_score,
                mentions_found=len(chatgpt_mentions),
                total_queries=len(chatgpt_analyses),
                citations=len(chatgpt_citations),
                avg_sentiment=_avg_sentiment(chatgpt_analyses),
            )
        )

    if perplexity_analyses:
        perp_mentions = [a for a in perplexity_analyses if a.get("mentioned")]
        perp_citations = [a for a in perplexity_analyses if a.get("citation_url")]
        platform_scores.append(
            PlatformScore(
                platform=Platform.PERPLEXITY,
                score=perplexity_score,
                mentions_found=len(perp_mentions),
                total_queries=len(perplexity_analyses),
                citations=len(perp_citations),
                avg_sentiment=_avg_sentiment(perplexity_analyses),
            )
        )

    # Total counts
    total_mentions = sum(1 for m in all_mentions if m.mentioned)
    total_citations = sum(1 for m in all_mentions if m.citation_url)

    # Top queries (ones where brand was mentioned)
    top_queries = [m.query for m in all_mentions if m.mentioned][:5]

    # Generate summary & recommendations
    summary = _generate_summary(brand_name, overall_score, total_mentions, len(all_mentions))
    recommendations = _generate_recommendations(
        brand_name, overall_score, chatgpt_analyses, perplexity_analyses
    )

    return AnalysisResult(
        brand_name=brand_name,
        domain=domain or None,
        visibility_score=overall_score,
        platform_scores=platform_scores,
        mentions=all_mentions,
        total_mentions=total_mentions,
        total_citations=total_citations,
        top_queries=top_queries,
        summary=summary,
        recommendations=recommendations,
    )


def _get_perplexity_citation(result: dict, brand_name: str) -> str | None:
    """Extract citation from Perplexity response metadata."""
    citations = result.get("citations", [])
    brand_lower = brand_name.lower().replace(" ", "")
    for url in citations:
        if brand_lower in url.lower():
            return url
    return citations[0] if citations else None


def _avg_sentiment(analyses: list[dict]) -> str:
    """Calculate the average sentiment from analyses."""
    mentioned = [a for a in analyses if a.get("mentioned")]
    if not mentioned:
        return "neutral"

    sentiment_score = {"positive": 1, "neutral": 0, "mixed": -0.5, "negative": -1}
    total = sum(sentiment_score.get(a.get("sentiment", "neutral"), 0) for a in mentioned)
    avg = total / len(mentioned)

    if avg > 0.3:
        return "positive"
    if avg < -0.3:
        return "negative"
    return "neutral"


def _generate_summary(brand_name: str, score: float, mentions: int, total: int) -> str:
    """Generate a Norwegian summary of the analysis."""
    if score >= 70:
        level = "sterk"
        desc = "godt synlig"
    elif score >= 50:
        level = "moderat"
        desc = "noe synlig"
    elif score >= 30:
        level = "svak"
        desc = "lite synlig"
    else:
        level = "svært lav"
        desc = "nesten ikke synlig"

    pct = round((mentions / total) * 100) if total > 0 else 0

    return (
        f"{brand_name} har en {level} AI-synlighet med en poengsum på {score}/100. "
        f"Merkevaren er {desc} i AI-søkemotorer og ble nevnt i {mentions} av {total} "
        f"spørringer ({pct}%)."
    )


def _generate_recommendations(
    brand_name: str, score: float, chatgpt: list, perplexity: list
) -> list[str]:
    """Generate actionable recommendations in Norwegian."""
    recs = []

    chatgpt_mentioned = sum(1 for a in chatgpt if a.get("mentioned"))
    perp_mentioned = sum(1 for a in perplexity if a.get("mentioned"))

    if score < 50:
        recs.append(
            "Optimaliser nettstedet ditt med strukturert data (Schema.org) for å øke sjansen "
            "for å bli sitert av AI-modeller."
        )

    chatgpt_citations = sum(1 for a in chatgpt if a.get("citation_url"))
    if chatgpt_citations == 0:
        recs.append(
            "Publiser autorativt innhold (bransjerapporter, guider) som AI-modeller "
            "kan bruke som kilder."
        )

    if chatgpt_mentioned < len(chatgpt) // 2:
        recs.append(
            f"Bygg sterkere merkevareautoritet — {brand_name} nevnes i under halvparten "
            f"av relevante ChatGPT-spørringer."
        )

    if len(perplexity) > 0 and perp_mentioned == 0:
        recs.append(
            "Fokuser på Perplexity-synlighet ved å sørge for at nettstedet ditt er "
            "godt indeksert og har oppdatert innhold."
        )

    negative = sum(1 for a in chatgpt + perplexity if a.get("sentiment") == "negative")
    if negative > 0:
        recs.append(
            "Adresser negativ omtale — noen AI-svar inneholder kritikk. Vurder å "
            "forbedre kundeopplevelsen og omdømmebygging."
        )

    if not recs:
        recs.append(
            f"Fortsett å bygge merkevarens tilstedeværelse — {brand_name} har allerede "
            f"god AI-synlighet. Overvåk regelmessig for å opprettholde posisjonen."
        )

    return recs[:5]
