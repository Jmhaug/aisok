"""Query OpenAI's API with web search to check brand visibility."""

from openai import AsyncOpenAI
from config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


async def query_chatgpt(query: str) -> dict:
    """Send a query to ChatGPT with web search enabled and return the response."""
    if not client:
        return {"query": query, "response": "", "error": "OpenAI API key not configured"}

    try:
        response = await client.responses.create(
            model="gpt-4.1-mini",
            tools=[{"type": "web_search_preview"}],
            input=query,
        )

        text = response.output_text

        return {
            "query": query,
            "response": text,
            "error": None,
        }
    except Exception as e:
        return {"query": query, "response": "", "error": str(e)}


async def batch_query(queries: list[str]) -> list[dict]:
    """Run multiple queries concurrently."""
    import asyncio

    tasks = [query_chatgpt(q) for q in queries]
    return await asyncio.gather(*tasks)
