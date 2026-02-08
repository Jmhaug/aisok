"""API routes for the analysis service."""

from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisRequest, AnalysisResult
from services.analyzer import run_analysis
from db.supabase import check_free_limit, store_analysis

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: AnalysisRequest):
    """Run a free AI visibility analysis."""
    # Validate input
    if not request.url and not request.prompt and not request.brand_name:
        raise HTTPException(
            status_code=400,
            detail="Oppgi en URL, et søkeord, eller et merkevarenavn.",
        )

    # Check free limit
    allowed = await check_free_limit(request.email)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Du har allerede brukt din gratis analyse. Opprett en konto for flere analyser.",
        )

    # Run analysis
    try:
        result = await run_analysis(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysefeil: {str(e)}",
        )

    # Store result
    await store_analysis(request.email, result.model_dump())

    return result


@router.get("/health")
async def health():
    return {"status": "ok"}
