/**
 * Transforms backend payloads into dashboard view models.
 * Supports AnalysisResult, QueryCaptureResult, and MonitoringSnapshot.
 */

const BRAND_COLORS = [
  "#14b8a6",
  "#22d3ee",
  "#f97316",
  "#f43f5e",
  "#84cc16",
  "#eab308",
  "#818cf8",
  "#a855f7",
];

export function transformAnalysis(result) {
  if (!result) return null;
  if (isMonitoringSnapshot(result)) return transformMonitoringSnapshot(result);
  if (isQueryCaptureResult(result)) return transformQueryCaptureResult(result);
  return transformBrandAnalysis(result);
}

function transformBrandAnalysis(result) {
  const now = new Date().toISOString();
  const todayStr = now.slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });

  const totalMentions = result.mentions?.filter((item) => item.mentioned).length || 0;
  const totalCitations = result.mentions?.filter((item) => item.citation_url).length || 0;

  const brands = [
    {
      id: "brand_1",
      name: result.brand_name,
      domain: result.domain || "",
      logo: (result.brand_name || "?").slice(0, 3).toUpperCase(),
      nameVariations: [result.brand_name],
      visibilityScore: Math.round(result.visibility_score || 0),
      previousScore: 0,
      mentionsThisWeek: totalMentions,
      citationsThisWeek: totalCitations,
      color: BRAND_COLORS[0],
    },
  ];

  const recentMentions = (result.mentions || []).map((item, idx) => ({
    id: `m${idx + 1}`,
    brandId: "brand_1",
    brandName: result.brand_name,
    platform: item.platform,
    query: item.query,
    response: item.response_snippet,
    rawOutput: null,
    mentionType: item.mention_type || "mention",
    sentiment: item.sentiment || "neutral",
    citationUrl: item.citation_url || null,
    hasCitation: Boolean(item.citation_url),
    timestamp: now,
    position: item.position ?? null,
  }));

  const platformBreakdown = (result.platform_scores || []).map((score) => ({
    platform: score.platform,
    mentions: score.mentions_found,
    citations: score.citations,
    avgScore: Math.round(score.score || 0),
  }));

  const activePrompts = result.top_queries?.length || 0;
  const kpiSummary = {
    totalBrands: 1,
    activeBrands: 1,
    totalMentionsThisWeek: totalMentions,
    mentionsChange: 0,
    totalCitationsThisWeek: totalCitations,
    citationsChange: 0,
    averageVisibilityScore: Math.round(result.visibility_score || 0),
    scoreChange: 0,
    activePrompts,
    scheduledQueries: activePrompts,
  };

  const visibilityTrends = [
    {
      date: dateLabel,
      [result.brand_name]: Math.round(result.visibility_score || 0),
    },
  ];

  const prompts = (result.top_queries || []).map((query, idx) => ({
    id: `p${idx + 1}`,
    query,
    category: "Generelt",
    platforms: ["chatgpt", "perplexity"],
    frequency: "daily",
    lastRun: now,
    isActive: true,
  }));

  const dailyAggregations = [
    {
      date: todayStr,
      totalMentions,
      totalCitations,
      avgScore: Math.round((result.visibility_score || 0) * 10) / 10,
    },
  ];

  const weekNum = getISOWeek(new Date());
  const weeklyAggregations = [
    {
      week: `Uke ${weekNum}`,
      totalMentions,
      totalCitations,
      avgScore: Math.round((result.visibility_score || 0) * 10) / 10,
    },
  ];

  return {
    brands,
    recentMentions,
    platformBreakdown,
    kpiSummary,
    visibilityTrends,
    prompts,
    dailyAggregations,
    weeklyAggregations,
    competitors: [],
  };
}

function transformQueryCaptureResult(result) {
  const fallbackSnapshot = {
    snapshot_type: "monitoring",
    config_id: result.run_id || "query-capture",
    run_id: result.run_id || "query-capture",
    created_at: result.created_at || new Date().toISOString(),
    profile: {
      business_name: result.query || "Sporring",
      industry: "services",
      size_band: "regional",
      country: "NO",
      scope_level: "country",
    },
    selected_competitors: [],
    active_queries: [
      {
        text: result.query || "Sporring",
        category: "query_capture",
        priority: 1,
        scope_tags: ["country"],
      },
    ],
    platforms: (result.outputs || []).map((output) => output.platform),
    query_runs: [result],
    aggregated_entities: result.entity_index || [],
    summary: result.summary || "",
  };
  return transformMonitoringSnapshot(fallbackSnapshot);
}

function transformMonitoringSnapshot(snapshot) {
  const now = snapshot.created_at || new Date().toISOString();
  const todayStr = now.slice(0, 10);
  const dateLabel = new Date(now).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });

  const primaryBrand = snapshot.profile?.business_name || "Merkevare";
  const competitorNames = (snapshot.selected_competitors || []).map((item) => item.name);
  const candidateNames = [primaryBrand, ...competitorNames];
  const uniqueNames = [...new Set(candidateNames.filter(Boolean))];

  const rows = snapshot.aggregated_entities || [];
  const runs = snapshot.query_runs || [];
  const brands = uniqueNames.map((name, idx) => {
    const norm = normalize(name);
    const matching = rows.filter((row) => normalize(row.entity) === norm);
    const avgPos = getAveragePosition(matching);
    const visibilityScore = matching.length
      ? Math.max(5, Math.round(100 - avgPos * 9))
      : 0;
    const citations = countBrandCitations(name, runs);

    return {
      id: `brand_${idx + 1}`,
      name,
      domain:
        snapshot.selected_competitors?.find((item) => normalize(item.name) === norm)?.domain ||
        "",
      logo: name.slice(0, 3).toUpperCase(),
      nameVariations: [name],
      visibilityScore,
      previousScore: 0,
      mentionsThisWeek: matching.length,
      citationsThisWeek: citations,
      color: BRAND_COLORS[idx % BRAND_COLORS.length],
    };
  });

  const brandByName = new Map(brands.map((brand) => [normalize(brand.name), brand]));
  const recentMentions = [];
  runs.forEach((run) => {
    const outputsByPlatform = new Map(
      (run.outputs || []).map((output) => [output.platform, output])
    );
    (run.entity_index || []).forEach((item, idx) => {
      const brand = brandByName.get(normalize(item.entity)) || brands[0];
      const output = outputsByPlatform.get(item.platform);
      recentMentions.push({
        id: `${run.run_id || "run"}_${idx}`,
        brandId: brand?.id || "brand_1",
        brandName: item.entity,
        platform: item.platform,
        query: run.query,
        response: output?.snippet || "",
        rawOutput: output?.raw_output || "",
        mentionType: item.mention_type || "mention",
        sentiment: item.sentiment || "neutral",
        citationUrl: (output?.citations || [])[0] || null,
        hasCitation: Boolean((output?.citations || [])[0]),
        timestamp: run.created_at || now,
        position: item.position ?? null,
      });
    });
  });

  const platforms = normalizePlatforms(snapshot.platforms, runs);
  const platformBreakdown = platforms.map((platform) => {
    const platformRows = rows.filter((row) => row.platform === platform);
    const platformOutputs = runs.flatMap((run) =>
      (run.outputs || []).filter((output) => output.platform === platform)
    );
    const avgScore = platformRows.length
      ? Math.round(
          platformRows.reduce(
            (sum, row) => sum + Math.max(0, 100 - (row.position || 10) * 9),
            0
          ) / platformRows.length
        )
      : 0;
    return {
      platform,
      mentions: platformRows.length,
      citations: platformOutputs.reduce(
        (sum, output) => sum + (output.citations?.length || 0),
        0
      ),
      avgScore,
    };
  });

  const competitors = [];
  if (brands.length > 1) {
    const primary = brands[0];
    brands.slice(1).forEach((brand, idx) => {
      competitors.push({
        id: `c${idx + 1}`,
        brandId: primary.id,
        competitorBrandId: brand.id,
        notes:
          snapshot.selected_competitors?.find(
            (item) => normalize(item.name) === normalize(brand.name)
          )?.reason || "Valgt i onboarding",
      });
    });
  }

  const averageVisibilityScore = brands.length
    ? Math.round(brands.reduce((sum, brand) => sum + brand.visibilityScore, 0) / brands.length)
    : 0;
  const totalMentions = rows.length;
  const totalCitations = runs.reduce(
    (sum, run) =>
      sum +
      (run.outputs || []).reduce(
        (inner, output) => inner + (output.citations?.length || 0),
        0
      ),
    0
  );

  const kpiSummary = {
    totalBrands: brands.length,
    activeBrands: brands.length,
    totalMentionsThisWeek: totalMentions,
    mentionsChange: 0,
    totalCitationsThisWeek: totalCitations,
    citationsChange: 0,
    averageVisibilityScore,
    scoreChange: 0,
    activePrompts: (snapshot.active_queries || []).length,
    scheduledQueries: (snapshot.active_queries || []).length,
  };

  const trendPoint = { date: dateLabel };
  brands.forEach((brand) => {
    trendPoint[brand.name] = brand.visibilityScore;
  });

  const prompts = (snapshot.active_queries || []).map((item, idx) => ({
    id: `p${idx + 1}`,
    query: item.text,
    category: item.category || "Generelt",
    platforms: platforms.map((platform) => platform.toLowerCase()),
    frequency: "daily",
    lastRun: now,
    isActive: true,
  }));

  const dailyAggregations = [
    {
      date: todayStr,
      totalMentions,
      totalCitations,
      avgScore: averageVisibilityScore,
    },
  ];

  const weekNum = getISOWeek(new Date(now));
  const weeklyAggregations = [
    {
      week: `Uke ${weekNum}`,
      totalMentions,
      totalCitations,
      avgScore: averageVisibilityScore,
    },
  ];

  return {
    brands,
    recentMentions,
    platformBreakdown,
    kpiSummary,
    visibilityTrends: [trendPoint],
    prompts,
    dailyAggregations,
    weeklyAggregations,
    competitors,
  };
}

function isMonitoringSnapshot(result) {
  return result?.snapshot_type === "monitoring" || Array.isArray(result?.query_runs);
}

function isQueryCaptureResult(result) {
  return Array.isArray(result?.outputs) && Array.isArray(result?.entity_index) && Boolean(result?.query);
}

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

function getAveragePosition(rows) {
  if (!rows.length) return 10;
  const total = rows.reduce((sum, row) => sum + (row.position || 10), 0);
  return total / rows.length;
}

function countBrandCitations(brandName, runs) {
  const needle = normalize(brandName);
  let count = 0;
  runs.forEach((run) => {
    (run.outputs || []).forEach((output) => {
      if (!(output.raw_output || "").toLowerCase().includes(needle)) return;
      count += output.citations?.length || 0;
    });
  });
  return count;
}

function normalizePlatforms(platforms, runs) {
  const list = Array.isArray(platforms) && platforms.length
    ? platforms.map((platform) => (typeof platform === "string" ? platform : platform?.value))
    : runs.flatMap((run) => (run.outputs || []).map((output) => output.platform));
  return [...new Set(list.filter(Boolean))];
}

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}
