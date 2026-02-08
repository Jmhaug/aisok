"""Analyze AI responses for brand mentions and calculate visibility scores."""

import re


def analyze_response(response_text: str, brand_name: str, brand_variations: list[str] = None) -> dict:
    """Analyze a single AI response for brand mentions."""
    if not response_text:
        return {
            "mentioned": False,
            "mention_type": "absent",
            "sentiment": "neutral",
            "citation_url": None,
            "position": None,
            "snippet": "",
        }

    text_lower = response_text.lower()
    brand_lower = brand_name.lower()

    # Build list of names to search for
    names = [brand_lower]
    if brand_variations:
        names.extend([v.lower() for v in brand_variations])

    # Check for mentions
    mentioned = any(name in text_lower for name in names)

    if not mentioned:
        return {
            "mentioned": False,
            "mention_type": "absent",
            "sentiment": "neutral",
            "citation_url": None,
            "position": None,
            "snippet": _extract_snippet(response_text, brand_name, 200),
        }

    # Determine mention type
    mention_type = _classify_mention(text_lower, names)

    # Determine sentiment
    sentiment = _analyze_sentiment(text_lower, names)

    # Find position in list (if response contains a numbered list)
    position = _find_list_position(text_lower, names)

    # Extract citation URLs
    citation_url = _extract_citation(response_text, brand_name)

    # Extract relevant snippet
    snippet = _extract_snippet(response_text, brand_name, 300)

    return {
        "mentioned": True,
        "mention_type": mention_type,
        "sentiment": sentiment,
        "citation_url": citation_url,
        "position": position,
        "snippet": snippet,
    }


def calculate_visibility_score(analyses: list[dict]) -> float:
    """Calculate overall visibility score (0-100) from analyzed responses."""
    if not analyses:
        return 0.0

    total_weight = 0
    total_score = 0

    for a in analyses:
        if not a.get("mentioned"):
            # Not mentioned = 0 points but still counts
            total_weight += 1
            continue

        points = 0
        weight = 1

        # Base points for being mentioned
        points += 40

        # Mention type bonus
        type_bonus = {
            "recommendation": 30,
            "comparison": 20,
            "mention": 10,
            "absent": 0,
        }
        points += type_bonus.get(a.get("mention_type", "mention"), 10)

        # Sentiment bonus
        sentiment_bonus = {
            "positive": 20,
            "neutral": 10,
            "mixed": 5,
            "negative": 0,
        }
        points += sentiment_bonus.get(a.get("sentiment", "neutral"), 10)

        # Position bonus (higher rank = more points)
        pos = a.get("position")
        if pos is not None:
            if pos <= 1:
                points += 10
            elif pos <= 3:
                points += 5

        # Citation bonus
        if a.get("citation_url"):
            points += 10

        # Cap at 100
        points = min(points, 100)

        total_score += points * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0

    return round(total_score / total_weight, 1)


def _classify_mention(text: str, names: list[str]) -> str:
    """Classify how the brand is mentioned."""
    recommend_words = ["anbefaler", "anbefalt", "recommend", "beste", "topp", "best"]
    compare_words = ["sammenlignet", "versus", "vs", "konkurrent", "alternativ"]

    # Check context around brand mention
    for name in names:
        idx = text.find(name)
        if idx == -1:
            continue
        context = text[max(0, idx - 100):idx + len(name) + 100]

        if any(w in context for w in recommend_words):
            return "recommendation"
        if any(w in context for w in compare_words):
            return "comparison"

    return "mention"


def _analyze_sentiment(text: str, names: list[str]) -> str:
    """Simple sentiment analysis around brand mentions."""
    positive_words = [
        "god", "godt", "bra", "utmerket", "populær", "ledende", "sterk",
        "pålitelig", "innovativ", "trygg", "fornøyd", "anbefalt", "beste",
        "konkurransedyktig", "great", "excellent", "trusted",
    ]
    negative_words = [
        "dårlig", "svak", "problem", "klage", "negativ", "dyrt", "dyr",
        "treg", "mangel", "kritikk", "poor", "worst", "avoid",
    ]

    pos_count = 0
    neg_count = 0

    for name in names:
        idx = text.find(name)
        if idx == -1:
            continue
        context = text[max(0, idx - 150):idx + len(name) + 150]

        pos_count += sum(1 for w in positive_words if w in context)
        neg_count += sum(1 for w in negative_words if w in context)

    if pos_count > neg_count:
        return "positive"
    if neg_count > pos_count:
        return "negative"
    if pos_count > 0 and neg_count > 0:
        return "mixed"
    return "neutral"


def _find_list_position(text: str, names: list[str]) -> int | None:
    """Find position in numbered lists (1. Brand, 2. Other, etc.)."""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        # Match patterns like "1.", "1)", "#1"
        match = re.match(r"^(?:\*\*)?(\d+)[.)]\s*\*?\*?", line_stripped)
        if match:
            num = int(match.group(1))
            if any(name in line_stripped.lower() for name in names):
                return num
    return None


def _extract_citation(text: str, brand_name: str) -> str | None:
    """Extract URLs from text that might be citations."""
    urls = re.findall(r'https?://[^\s\)\"\'<>]+', text)
    brand_lower = brand_name.lower().replace(" ", "")

    for url in urls:
        url_lower = url.lower()
        if brand_lower in url_lower or brand_lower[:4] in url_lower:
            return url.rstrip(".,;:")

    return urls[0].rstrip(".,;:") if urls else None


def _extract_snippet(text: str, brand_name: str, max_len: int = 200) -> str:
    """Extract the most relevant snippet containing the brand name."""
    idx = text.lower().find(brand_name.lower())
    if idx == -1:
        return text[:max_len] + "..." if len(text) > max_len else text

    start = max(0, idx - 50)
    end = min(len(text), idx + max_len - 50)
    snippet = text[start:end]

    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."

    return snippet
