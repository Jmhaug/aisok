"""Asynchronous onboarding monitoring job runner."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from db.supabase import store_monitoring_job, store_query_capture
from models.schemas import (
    BusinessProfile,
    CompetitorCandidate,
    EntityIndexItem,
    MonitoringJobProgress,
    MonitoringJobStatusResponse,
    MonitoringSnapshot,
    Platform,
    QueryCaptureRequest,
    QueryCaptureResult,
    SuggestedQuery,
)
from services.query_capture import run_query_capture

_JOBS: dict[str, MonitoringJobStatusResponse] = {}
_JOBS_LOCK = asyncio.Lock()


async def get_monitoring_job_status(job_id: str) -> MonitoringJobStatusResponse | None:
    async with _JOBS_LOCK:
        return _JOBS.get(job_id)


async def start_onboarding_job(
    *,
    config_id: str,
    email: str,
    profile: BusinessProfile,
    selected_competitors: list[CompetitorCandidate],
    active_queries: list[SuggestedQuery],
    platforms: list[Platform],
) -> str:
    """Create and start an asynchronous monitoring job."""
    job_id = str(uuid4())
    progress = MonitoringJobProgress(
        total_queries=len(active_queries),
        completed_queries=0,
        failed_queries=0,
        current_query=None,
    )
    job = MonitoringJobStatusResponse(
        job_id=job_id,
        status="queued",
        progress=progress,
        partial_top_entities=[],
        snapshot=None,
        error=None,
    )

    async with _JOBS_LOCK:
        _JOBS[job_id] = job

    await _persist_job(config_id=config_id, job=job)

    asyncio.create_task(
        _run_job(
            job_id=job_id,
            config_id=config_id,
            email=email,
            profile=profile,
            selected_competitors=selected_competitors,
            active_queries=active_queries,
            platforms=platforms,
        )
    )
    return job_id


async def _run_job(
    *,
    job_id: str,
    config_id: str,
    email: str,
    profile: BusinessProfile,
    selected_competitors: list[CompetitorCandidate],
    active_queries: list[SuggestedQuery],
    platforms: list[Platform],
) -> None:
    await _set_job_status(job_id=job_id, status="running")

    semaphore = asyncio.Semaphore(2)
    query_results: list[QueryCaptureResult] = []
    all_entities: list[EntityIndexItem] = []

    async def worker(item: SuggestedQuery) -> tuple[QueryCaptureResult | None, Exception | None]:
        async with semaphore:
            await _set_current_query(job_id, item.text)
            try:
                result = await run_query_capture(
                    QueryCaptureRequest(email=email, query=item.text, platforms=platforms)
                )
                await store_query_capture(
                    email,
                    result.model_dump(),
                    metadata={
                        "config_id": config_id,
                        "job_id": job_id,
                        "query_category": item.category,
                        "scope_level": profile.scope_level,
                    },
                )
                return result, None
            except Exception as exc:
                return None, exc

    tasks = [asyncio.create_task(worker(item)) for item in active_queries]

    for task in asyncio.as_completed(tasks):
        result, error = await task
        if result is None:
            await _increment_progress(job_id, failed=True)
            if error:
                await _set_job_error(job_id, str(error))
            continue

        query_results.append(result)
        all_entities.extend(result.entity_index)
        await _increment_progress(job_id, failed=False)
        await _set_partial_entities(job_id, all_entities)

    created_at = datetime.now(timezone.utc).isoformat()
    snapshot = MonitoringSnapshot(
        config_id=config_id,
        run_id=str(uuid4()),
        created_at=created_at,
        profile=profile,
        selected_competitors=selected_competitors,
        active_queries=active_queries,
        platforms=platforms,
        query_runs=query_results,
        aggregated_entities=all_entities,
        summary=_build_summary(profile, query_results, all_entities),
    )

    await _set_job_complete(job_id=job_id, snapshot=snapshot)
    job = await get_monitoring_job_status(job_id)
    if job:
        await _persist_job(config_id=config_id, job=job)


def _build_summary(
    profile: BusinessProfile,
    query_results: list[QueryCaptureResult],
    entities: list[EntityIndexItem],
) -> str:
    unique_entities = len({row.entity.lower().strip() for row in entities})
    return (
        f"{profile.business_name} overvakes nå med {len(query_results)} spørringer. "
        f"Fant {len(entities)} omtaler fordelt på {unique_entities} unike aktører."
    )


async def _set_job_status(*, job_id: str, status: str) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.status = status
        _JOBS[job_id] = job


async def _set_current_query(job_id: str, query: str) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.progress.current_query = query
        _JOBS[job_id] = job


async def _set_partial_entities(job_id: str, entities: list[EntityIndexItem]) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        ordered = sorted(
            entities,
            key=lambda row: ((row.position or 999), row.platform, row.entity.lower()),
        )
        job.partial_top_entities = ordered[:10]
        _JOBS[job_id] = job


async def _increment_progress(job_id: str, failed: bool) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.progress.completed_queries += 1
        if failed:
            job.progress.failed_queries += 1
        _JOBS[job_id] = job


async def _set_job_error(job_id: str, error: str) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.error = error
        _JOBS[job_id] = job


async def _set_job_complete(job_id: str, snapshot: MonitoringSnapshot) -> None:
    async with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if not job:
            return
        job.status = "completed"
        job.progress.current_query = None
        job.snapshot = snapshot
        _JOBS[job_id] = job


async def _persist_job(config_id: str, job: MonitoringJobStatusResponse) -> None:
    payload = {
        "job_id": job.job_id,
        "config_id": config_id,
        "status": job.status,
        "progress_json": job.progress.model_dump(),
        "partial_top_entities_json": [row.model_dump() for row in job.partial_top_entities],
        "snapshot_json": job.snapshot.model_dump() if job.snapshot else None,
        "error": job.error,
    }
    await store_monitoring_job(payload)
