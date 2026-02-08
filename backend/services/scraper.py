import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse


async def extract_brand_from_url(url: str) -> dict:
    """Scrape a URL and extract brand name, description, and domain."""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    domain = parsed.hostname or ""
    # Remove www. prefix
    if domain.startswith("www."):
        domain = domain[4:]

    result = {
        "brand_name": domain.split(".")[0].capitalize(),
        "domain": domain,
        "description": "",
    }

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try og:site_name first
        og_site = soup.find("meta", property="og:site_name")
        if og_site and og_site.get("content"):
            result["brand_name"] = og_site["content"]

        # Fallback to title
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()
            # Take the part before common separators
            for sep in [" | ", " - ", " — ", " – ", " :: "]:
                if sep in title:
                    title = title.split(sep)[0].strip()
                    break
            result["brand_name"] = title

        # Get description
        og_desc = soup.find("meta", property="og:description")
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if og_desc and og_desc.get("content"):
            result["description"] = og_desc["content"][:300]
        elif meta_desc and meta_desc.get("content"):
            result["description"] = meta_desc["content"][:300]

    except Exception:
        # If scraping fails, just use the domain-based name
        pass

    return result
