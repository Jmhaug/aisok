import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from models.schemas import BusinessProfile, CompetitorCandidate
from services.onboarding_suggester import (
    infer_business_profile,
    suggest_competitors,
    suggest_queries,
)


class OnboardingSuggesterTests(unittest.IsolatedAsyncioTestCase):
    async def test_infer_profile_sets_city_scope_for_local_business(self):
        with patch(
            "services.onboarding_suggester._llm_business_profile",
            new=AsyncMock(return_value=None),
        ):
            profile = await infer_business_profile("Grov Sykkel Bergen")

        self.assertEqual(profile.scope_level, "city")
        self.assertEqual(profile.country, "NO")

    async def test_competitor_suggestions_remove_self_and_duplicates(self):
        profile = BusinessProfile(
            business_name="DNB",
            industry="banking",
            size_band="enterprise",
            country="NO",
            scope_level="country",
        )
        llm_rows = [
            CompetitorCandidate(name="DNB", domain="dnb.no", relevance_score=0.99),
            CompetitorCandidate(
                name="Nordea Norge", domain="nordea.no", relevance_score=0.91
            ),
            CompetitorCandidate(
                name="Nordea Norge", domain="nordea.no", relevance_score=0.85
            ),
        ]

        with patch(
            "services.onboarding_suggester._llm_competitors",
            new=AsyncMock(return_value=llm_rows),
        ), patch(
            "services.onboarding_suggester._fallback_competitors",
            return_value=[],
        ):
            rows = await suggest_competitors(profile, limit=8)

        self.assertFalse(any(row.name == "DNB" for row in rows))
        self.assertEqual(len([row for row in rows if row.name == "Nordea Norge"]), 1)

    async def test_local_scope_queries_include_city_token(self):
        profile = BusinessProfile(
            business_name="Grov Sykkel",
            industry="bike_shop",
            size_band="local",
            country="NO",
            city="Bergen",
            scope_level="city",
        )
        competitors = [
            CompetitorCandidate(name="Bergen Bike Shop", relevance_score=0.9),
            CompetitorCandidate(name="Sykkelhuset Bergen", relevance_score=0.8),
        ]

        with patch(
            "services.onboarding_suggester._llm_queries",
            new=AsyncMock(return_value=[]),
        ):
            queries = await suggest_queries(profile, competitors, limit=12)

        city_mentions = sum(1 for item in queries if "bergen" in item.text.lower())
        self.assertGreaterEqual(city_mentions, 3)


if __name__ == "__main__":
    unittest.main()
