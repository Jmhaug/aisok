from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from enum import Enum


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
