import asyncio
import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from models.schemas import (
    BusinessProfile,
    EntityIndexItem,
    ModelOutput,
    Platform,
    QueryCaptureResult,
    SuggestedQuery,
)
from services.monitoring_runner import get_monitoring_job_status, start_onboarding_job


class MonitoringRunnerTests(unittest.IsolatedAsyncioTestCase):
    async def test_start_job_reaches_completed(self):
        profile = BusinessProfile(
            business_name="Grov Sykkel",
            industry="bike_shop",
            size_band="local",
            country="NO",
            city="Bergen",
            scope_level="city",
            confidence=0.8,
        )
        query = SuggestedQuery(
            text="beste sykkelbutikk i Bergen",
            category="local_discovery",
            priority=1,
            scope_tags=["city"],
        )
        query_result = QueryCaptureResult(
            query=query.text,
            query_normalized=query.text.lower(),
            run_id="run_1",
            created_at="2026-02-10T12:00:00Z",
            outputs=[
                ModelOutput(
                    platform=Platform.CHATGPT,
                    model="gpt-4.1-mini",
                    query=query.text,
                    raw_output="1. Grov Sykkel\n2. Bergen Bike Shop",
                    snippet="1. Grov Sykkel",
                    citations=["https://example.no"],
                    error=None,
                )
            ],
            entity_index=[
                EntityIndexItem(
                    platform=Platform.CHATGPT,
                    entity="Grov Sykkel",
                    position=1,
                    mention_type="mention",
                    sentiment="neutral",
                    confidence=0.95,
                )
            ],
            summary="ok",
        )

        with patch(
            "services.monitoring_runner.run_query_capture",
            new=AsyncMock(return_value=query_result),
        ), patch(
            "services.monitoring_runner.store_query_capture", new=AsyncMock()
        ), patch(
            "services.monitoring_runner.store_monitoring_job", new=AsyncMock()
        ):
            job_id = await start_onboarding_job(
                config_id="config_1",
                email="user@example.com",
                profile=profile,
                selected_competitors=[],
                active_queries=[query],
                platforms=[Platform.CHATGPT],
            )
            initial = await get_monitoring_job_status(job_id)
            self.assertEqual(initial.status, "queued")

            final = None
            for _ in range(30):
                await asyncio.sleep(0.05)
                final = await get_monitoring_job_status(job_id)
                if final and final.status == "completed":
                    break

        self.assertIsNotNone(final)
        self.assertEqual(final.status, "completed")
        self.assertEqual(final.progress.completed_queries, 1)
        self.assertIsNotNone(final.snapshot)


if __name__ == "__main__":
    unittest.main()
