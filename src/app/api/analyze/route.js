/**
 * Next.js API route that proxies analysis requests to the FastAPI backend.
 * POST /api/analyze → FastAPI /api/v1/analyze
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();

    const resp = await fetch(`${BACKEND_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return Response.json(
        { error: data.detail || "Analyse feilet" },
        { status: resp.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Kunne ikke koble til analysetjenesten. Prøv igjen senere." },
      { status: 503 }
    );
  }
}
