"""Generate relevant Norwegian search queries for brand visibility analysis."""


def generate_queries(brand_name: str, domain: str = "", description: str = "") -> list[str]:
    """Generate 8 search queries in Norwegian to test brand visibility."""
    queries = [
        f"Hva er {brand_name}?",
        f"Er {brand_name} et godt valg i Norge?",
        f"Anbefal alternativer til {brand_name}",
        f"Sammenlign {brand_name} med konkurrenter",
        f"Fordeler og ulemper med {brand_name}",
        f"{brand_name} anmeldelser og erfaringer",
        f"Beste {_guess_category(brand_name, description)} i Norge",
        f"Hvilke {_guess_category(brand_name, description)} er mest populære i Norge?",
    ]
    return queries


def _guess_category(brand_name: str, description: str = "") -> str:
    """Guess the business category from brand name and description."""
    text = f"{brand_name} {description}".lower()

    categories = {
        "bank": ["bank", "finans", "lån", "sparing", "konto"],
        "forsikring": ["forsikring", "insurance", "polise"],
        "eiendomsmegler": ["eiendom", "bolig", "megler"],
        "regnskapsfører": ["regnskap", "accounting", "bokføring"],
        "advokat": ["advokat", "jus", "lov", "lawyer"],
        "restaurant": ["restaurant", "mat", "food", "café"],
        "nettbutikk": ["nettbutikk", "e-commerce", "shop", "butikk"],
        "teknologiselskap": ["tech", "software", "saas", "app", "digital"],
        "tjenester": ["tjeneste", "service", "konsulent"],
    }

    for category, keywords in categories.items():
        if any(kw in text for kw in keywords):
            return f"{category}er"

    return "selskaper"
