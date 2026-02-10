"""API routes for analysis, query capture, and onboarding monitoring."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from db.supabase import (
    check_free_limit,
    store_analysis,
    store_monitoring_config,
    store_query_capture,
)
from models.schemas import (
    AnalysisRequest,
    AnalysisResult,
    OnboardingBootstrapRequest,
    OnboardingBootstrapResponse,
    OnboardingCompleteRequest,
    OnboardingCompleteResponse,
    QueryCaptureRequest,
    QueryCaptureResult,
    RecomputeQueriesRequest,
    RecomputeQueriesResponse,
    MonitoringJobStatusResponse,
)
from services.analyzer import run_analysis
from services.monitoring_runner import get_monitoring_job_status, start_onboarding_job
from services.onboarding_suggester import (
    infer_business_profile,
    suggest_competitors,
    suggest_queries,
)
from services.query_capture import run_query_capture

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: AnalysisRequest):
    """Run a free AI visibility analysis."""
    if not request.url and not request.prompt and not request.brand_name:
        raise HTTPException(
            status_code=400,
            detail="Oppgi en URL, et søkeord, eller et merkevarenavn.",
        )

    allowed = await check_free_limit(request.email)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Du har allerede brukt din gratis analyse. Opprett en konto for flere analyser.",
        )

    try:
        result = await run_analysis(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysefeil: {str(exc)}",
        )

    await store_analysis(request.email, result.model_dump())
    return result


@router.post("/query-capture", response_model=QueryCaptureResult)
async def query_capture(request: QueryCaptureRequest):
    """Run exact query capture mode for free-text prompts."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Oppgi en søkespørring.")

    allowed = await check_free_limit(request.email)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Du har allerede brukt din gratis analyse. Opprett en konto for flere analyser.",
        )

    try:
        result = await run_query_capture(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Query-capture feilet: {str(exc)}",
        )

    await store_query_capture(request.email, result.model_dump())
    return result


@router.post("/onboarding/bootstrap", response_model=OnboardingBootstrapResponse)
async def onboarding_bootstrap(request: OnboardingBootstrapRequest):
    """Build onboarding defaults from raw business input."""
    raw_input = request.raw_input.strip()
    if not raw_input:
        raise HTTPException(status_code=400, detail="Oppgi et virksomhetsnavn eller nettadresse.")

    try:
        profile = await infer_business_profile(raw_input, request.locale)
        competitors = await suggest_competitors(profile, limit=8)
        queries = await suggest_queries(profile, competitors[:5], limit=12)
        return OnboardingBootstrapResponse(
            profile=profile,
            suggested_competitors=competitors,
            suggested_queries=queries,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Kunne ikke bygge onboarding-forslag: {str(exc)}",
        )


@router.post("/onboarding/queries/recompute", response_model=RecomputeQueriesResponse)
async def onboarding_recompute_queries(request: RecomputeQueriesRequest):
    """Recompute query suggestions based on selected competitors."""
    try:
        queries = await suggest_queries(
            request.profile,
            request.selected_competitors,
            limit=12,
        )
        return RecomputeQueriesResponse(suggested_queries=queries)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Kunne ikke oppdatere spørringsforslag: {str(exc)}",
        )


@router.post("/onboarding/complete", response_model=OnboardingCompleteResponse)
async def onboarding_complete(request: OnboardingCompleteRequest):
    """Persist onboarding config and optionally start first monitoring run."""
    if len(request.selected_competitors) < 2:
        raise HTTPException(
            status_code=400,
            detail="Velg minst 2 konkurrenter for presis overvaking.",
        )
    if len(request.active_queries) < 5:
        raise HTTPException(
            status_code=400,
            detail="Aktiver minst 5 spørringer for presise analyser.",
        )

    allowed = await check_free_limit(request.email)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Du har allerede brukt din gratis analyse. Opprett en konto for flere analyser.",
        )

    config_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    config_payload = {
        "id": config_id,
        "profile_json": request.profile.model_dump(),
        "competitors_json": [row.model_dump() for row in request.selected_competitors],
        "queries_json": [row.model_dump() for row in request.active_queries],
        "platforms_json": [platform.value for platform in request.platforms],
        "scope_level": request.profile.scope_level,
        "created_at": created_at,
    }

    stored_id = await store_monitoring_config(request.email, config_payload)
    if stored_id:
        config_id = stored_id

    estimated_duration_sec = max(30, len(request.active_queries) * len(request.platforms) * 8)

    job_id: str | None = None
    status = "configured"
    if request.auto_run:
        job_id = await start_onboarding_job(
            config_id=config_id,
            email=request.email,
            profile=request.profile,
            selected_competitors=request.selected_competitors,
            active_queries=request.active_queries,
            platforms=request.platforms,
        )
        status = "queued"

    return OnboardingCompleteResponse(
        config_id=config_id,
        job_id=job_id,
        status=status,
        estimated_duration_sec=estimated_duration_sec,
    )


@router.get("/onboarding/jobs/{job_id}", response_model=MonitoringJobStatusResponse)
async def onboarding_job_status(job_id: str):
    """Get current onboarding monitoring job status."""
    job = await get_monitoring_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Jobben finnes ikke.")
    return job


@router.get("/health")
async def health():
    return {"status": "ok"}
