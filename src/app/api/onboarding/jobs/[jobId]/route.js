const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(_request, { params }) {
  try {
    const jobId = params?.jobId;
    if (!jobId) {
      return Response.json({ error: "Mangler jobId" }, { status: 400 });
    }

    const resp = await fetch(`${BACKEND_URL}/api/v1/onboarding/jobs/${jobId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return Response.json(
        { error: data.detail || "Kunne ikke hente jobbstatus" },
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
