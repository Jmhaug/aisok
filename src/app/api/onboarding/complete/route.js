const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const resp = await fetch(`${BACKEND_URL}/api/v1/onboarding/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return Response.json(
        { error: data.detail || "Kunne ikke fullfore onboarding" },
        { status: resp.status }
      );
    }
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Kunne ikke koble til analysetjenesten." },
      { status: 503 }
    );
  }
}
