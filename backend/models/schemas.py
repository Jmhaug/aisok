from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class AnalysisRequest(BaseModel):
    """Request for a free analysis — user provides email + (url OR prompt)."""
    email: EmailStr
    url: Optional[str] = None
    prompt: Optional[str] = None
    brand_name: Optional[str] = None

    def get_brand_input(self) -> str:
        if self.brand_name:
            return self.brand_name
        if self.url:
            return self.url
        return self.prompt or ""


class Platform(str, Enum):
    CHATGPT = "ChatGPT"
    PERPLEXITY = "Perplexity"


class Mention(BaseModel):
    platform: Platform
    query: str
    response_snippet: str
    mentioned: bool
    mention_type: Optional[str] = None  # recommendation, comparison, mention, absent
    sentiment: Optional[str] = None  # positive, neutral, negative, mixed
    citation_url: Optional[str] = None
    position: Optional[int] = None  # rank position if in a list


class PlatformScore(BaseModel):
    platform: Platform
    score: float
    mentions_found: int
    total_queries: int
    citations: int
    avg_sentiment: str


class AnalysisResult(BaseModel):
    brand_name: str
    domain: Optional[str] = None
    visibility_score: float
    platform_scores: list[PlatformScore]
    mentions: list[Mention]
    total_mentions: int
    total_citations: int
    top_queries: list[str]
    summary: str
    recommendations: list[str]


class QueryCaptureRequest(BaseModel):
    """Request for exact query capture mode."""

    email: EmailStr
    query: str
    platforms: list[Platform] = Field(
        default_factory=lambda: [Platform.CHATGPT, Platform.PERPLEXITY]
    )


class EntityIndexItem(BaseModel):
    platform: Platform
    entity: str
    position: Optional[int] = None
    mention_type: str
    sentiment: str
    confidence: float


class ModelOutput(BaseModel):
    platform: Platform
    model: str
    query: str
    raw_output: str
    snippet: str
    citations: list[str] = Field(default_factory=list)
    error: Optional[str] = None


class QueryCaptureResult(BaseModel):
    query: str
    query_normalized: str
    run_id: str
    created_at: str
    outputs: list[ModelOutput]
    entity_index: list[EntityIndexItem]
    summary: str


class BusinessProfile(BaseModel):
    business_name: str
    industry: str
    size_band: str
    country: str = "NO"
    region: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    scope_level: str = "country"
    confidence: float = 0.0


class CompetitorCandidate(BaseModel):
    name: str
    domain: Optional[str] = None
    scope_match: str = "country"
    relevance_score: float = 0.0
    reason: str = ""


class SuggestedQuery(BaseModel):
    text: str
    category: str
    priority: int
    scope_tags: list[str] = Field(default_factory=list)


class OnboardingBootstrapRequest(BaseModel):
    email: EmailStr
    raw_input: str
    locale: str = "nb-NO"


class OnboardingBootstrapResponse(BaseModel):
    profile: BusinessProfile
    suggested_competitors: list[CompetitorCandidate]
    suggested_queries: list[SuggestedQuery]


class RecomputeQueriesRequest(BaseModel):
    email: EmailStr
    profile: BusinessProfile
    selected_competitors: list[CompetitorCandidate] = Field(default_factory=list)


class RecomputeQueriesResponse(BaseModel):
    suggested_queries: list[SuggestedQuery]


class MonitoringJobProgress(BaseModel):
    total_queries: int
    completed_queries: int
    failed_queries: int
    current_query: Optional[str] = None


class MonitoringSnapshot(BaseModel):
    snapshot_type: str = "monitoring"
    config_id: str
    run_id: str
    created_at: str
    profile: BusinessProfile
    selected_competitors: list[CompetitorCandidate]
    active_queries: list[SuggestedQuery]
    platforms: list[Platform]
    query_runs: list[QueryCaptureResult]
    aggregated_entities: list[EntityIndexItem]
    summary: str


class OnboardingCompleteRequest(BaseModel):
    email: EmailStr
    profile: BusinessProfile
    selected_competitors: list[CompetitorCandidate]
    active_queries: list[SuggestedQuery]
    platforms: list[Platform] = Field(
        default_factory=lambda: [Platform.CHATGPT, Platform.PERPLEXITY]
    )
    auto_run: bool = True


class OnboardingCompleteResponse(BaseModel):
    config_id: str
    job_id: Optional[str] = None
    status: str
    estimated_duration_sec: int


class MonitoringJobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: MonitoringJobProgress
    partial_top_entities: list[EntityIndexItem] = Field(default_factory=list)
    snapshot: Optional[MonitoringSnapshot] = None
    error: Optional[str] = None
