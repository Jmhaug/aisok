import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient

from main import app
from models.schemas import BusinessProfile, CompetitorCandidate, SuggestedQuery


class OnboardingRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def _valid_complete_payload(self):
        return {
            "email": "user@example.com",
            "profile": {
                "business_name": "Grov Sykkel",
                "industry": "bike_shop",
                "size_band": "local",
                "country": "NO",
                "city": "Bergen",
                "scope_level": "city",
                "confidence": 0.8,
            },
            "selected_competitors": [
                {
                    "name": "Bergen Bike Shop",
                    "domain": "example.no",
                    "scope_match": "city",
                    "relevance_score": 0.9,
                    "reason": "Lokal konkurrent",
                },
                {
                    "name": "Sykkelhuset Bergen",
                    "domain": "example2.no",
                    "scope_match": "city",
                    "relevance_score": 0.85,
                    "reason": "Lokal konkurrent",
                },
            ],
            "active_queries": [
                {"text": "beste sykkelbutikk i Bergen", "category": "local_discovery", "priority": 1, "scope_tags": ["city"]},
                {"text": "Grov Sykkel vs Bergen Bike Shop", "category": "comparison", "priority": 2, "scope_tags": ["city", "competitor"]},
                {"text": "sykkelservice i Bergen", "category": "local_intent", "priority": 3, "scope_tags": ["city"]},
                {"text": "anbefal sykkelbutikk i Bergen", "category": "local_discovery", "priority": 4, "scope_tags": ["city"]},
                {"text": "rimelig sykkelbutikk i Bergen", "category": "local_intent", "priority": 5, "scope_tags": ["city"]},
            ],
            "platforms": ["ChatGPT", "Perplexity"],
            "auto_run": True,
        }

    def test_bootstrap_returns_profile_competitors_queries(self):
        profile = BusinessProfile(
            business_name="Grov Sykkel",
            industry="bike_shop",
            size_band="local",
            country="NO",
            city="Bergen",
            scope_level="city",
            confidence=0.8,
        )
        competitors = [
            CompetitorCandidate(
                name="Bergen Bike Shop",
                domain="example.no",
                scope_match="city",
                relevance_score=0.9,
                reason="Lokal konkurrent",
            )
        ]
        queries = [
            SuggestedQuery(
                text="beste sykkelbutikk i Bergen",
                category="local_discovery",
                priority=1,
                scope_tags=["city"],
            )
        ]

        with patch(
            "api.routes.infer_business_profile",
            new=AsyncMock(return_value=profile),
        ), patch(
            "api.routes.suggest_competitors",
            new=AsyncMock(return_value=competitors),
        ), patch(
            "api.routes.suggest_queries",
            new=AsyncMock(return_value=queries),
        ):
            response = self.client.post(
                "/api/v1/onboarding/bootstrap",
                json={
                    "email": "user@example.com",
                    "raw_input": "Grov Sykkel",
                    "locale": "nb-NO",
                },
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["profile"]["business_name"], "Grov Sykkel")
        self.assertEqual(len(body["suggested_competitors"]), 1)
        self.assertEqual(len(body["suggested_queries"]), 1)

    def test_complete_rejects_fewer_than_two_competitors(self):
        payload = self._valid_complete_payload()
        payload["selected_competitors"] = payload["selected_competitors"][:1]

        response = self.client.post("/api/v1/onboarding/complete", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("minst 2", response.json()["detail"])

    def test_complete_rejects_fewer_than_five_queries(self):
        payload = self._valid_complete_payload()
        payload["active_queries"] = payload["active_queries"][:4]

        response = self.client.post("/api/v1/onboarding/complete", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("minst 5", response.json()["detail"])

    def test_complete_returns_job_and_config(self):
        payload = self._valid_complete_payload()

        with patch("api.routes.check_free_limit", new=AsyncMock(return_value=True)), patch(
            "api.routes.store_monitoring_config", new=AsyncMock(return_value=None)
        ), patch(
            "api.routes.start_onboarding_job", new=AsyncMock(return_value="job_123")
        ):
            response = self.client.post("/api/v1/onboarding/complete", json=payload)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "queued")
        self.assertEqual(body["job_id"], "job_123")
        self.assertTrue(body["config_id"])


if __name__ == "__main__":
    unittest.main()
