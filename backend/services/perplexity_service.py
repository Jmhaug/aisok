"""Query Perplexity's Sonar API to check brand visibility."""

import httpx
from config import settings

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_MODEL = "sonar"


async def query_perplexity(query: str) -> dict:
    """Send a query to Perplexity Sonar and return the response."""
    if not settings.perplexity_api_key:
        return {
            "query": query,
            "model": PERPLEXITY_MODEL,
            "response": "",
            "citations": [],
            "error": "Perplexity API key not configured",
        }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                PERPLEXITY_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.perplexity_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": PERPLEXITY_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Du er en hjelpsom assistent som svarer på norsk. Gi detaljerte, faktabaserte svar.",
                        },
                        {"role": "user", "content": query},
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["choices"][0]["message"]["content"]
        citations = data.get("citations", [])

        return {
            "query": query,
            "model": PERPLEXITY_MODEL,
            "response": text,
            "citations": citations,
            "error": None,
        }
    except Exception as e:
        return {
            "query": query,
            "model": PERPLEXITY_MODEL,
            "response": "",
            "citations": [],
            "error": str(e),
        }


async def batch_query(queries: list[str]) -> list[dict]:
    """Run multiple queries concurrently."""
    import asyncio

    tasks = [query_perplexity(q) for q in queries]
    return await asyncio.gather(*tasks)
