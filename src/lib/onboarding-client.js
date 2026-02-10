export const MONITORING_CONFIG_KEY = "lgpsm_monitoring_config";
export const MONITORING_SNAPSHOT_KEY = "lgpsm_monitoring_snapshot";

async function parseResponse(resp, fallbackError) {
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || fallbackError);
  }
  return data;
}

export async function bootstrapOnboarding(payload) {
  const resp = await fetch("/api/onboarding/bootstrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(resp, "Kunne ikke starte onboarding");
}

export async function recomputeOnboardingQueries(payload) {
  const resp = await fetch("/api/onboarding/queries/recompute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(resp, "Kunne ikke oppdatere sporringer");
}

export async function completeOnboarding(payload) {
  const resp = await fetch("/api/onboarding/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(resp, "Kunne ikke fullfore onboarding");
}

export async function fetchOnboardingJob(jobId) {
  const resp = await fetch(`/api/onboarding/jobs/${jobId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  return parseResponse(resp, "Kunne ikke hente jobbstatus");
}
