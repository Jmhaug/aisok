"""Query OpenAI's API with web search to check brand visibility."""

from openai import AsyncOpenAI
from config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
OPENAI_MODEL = "gpt-4.1-mini"


async def query_chatgpt(query: str) -> dict:
    """Send a query to ChatGPT with web search enabled and return the response."""
    if not client:
        return {
            "query": query,
            "model": OPENAI_MODEL,
            "response": "",
            "citations": [],
            "error": "OpenAI API key not configured",
        }

    try:
        response = await client.responses.create(
            model=OPENAI_MODEL,
            tools=[{"type": "web_search_preview"}],
            input=query,
        )

        text = response.output_text
        citations = _extract_citations(response)

        return {
            "query": query,
            "model": OPENAI_MODEL,
            "response": text,
            "citations": citations,
            "error": None,
        }
    except Exception as e:
        return {
            "query": query,
            "model": OPENAI_MODEL,
            "response": "",
            "citations": [],
            "error": str(e),
        }


async def batch_query(queries: list[str]) -> list[dict]:
    """Run multiple queries concurrently."""
    import asyncio

    tasks = [query_chatgpt(q) for q in queries]
    return await asyncio.gather(*tasks)


def _extract_citations(response) -> list[str]:
    """Best-effort citation extraction from OpenAI response annotations."""
    urls: list[str] = []
    for output_item in getattr(response, "output", []) or []:
        for content in getattr(output_item, "content", []) or []:
            for annotation in getattr(content, "annotations", []) or []:
                url = getattr(annotation, "url", None)
                if not url and isinstance(annotation, dict):
                    url = annotation.get("url")
                if url and url not in urls:
                    urls.append(url)
    return urls
