/**
 * Transforms a backend AnalysisResult into the shapes that dashboard pages expect
 * (matching the structures in mock-data.js).
 */

const BRAND_COLORS = [
  "#a78bfa", "#38bdf8", "#f87171", "#4ade80", "#fbbf24",
  "#f472b6", "#fb923c", "#818cf8",
];

export function transformAnalysis(result) {
  if (!result) return null;

  const now = new Date().toISOString();
  const todayStr = now.slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

  // --- brands[] ---
  const totalMentions = result.mentions?.filter((m) => m.mentioned).length || 0;
  const totalCitations = result.mentions?.filter((m) => m.citation_url).length || 0;

  const brands = [
    {
      id: "brand_1",
      name: result.brand_name,
      domain: result.domain || "",
      logo: result.brand_name?.slice(0, 3).toUpperCase() || "?",
      nameVariations: [result.brand_name],
      visibilityScore: Math.round(result.visibility_score),
      previousScore: 0,
      mentionsThisWeek: totalMentions,
      citationsThisWeek: totalCitations,
      color: BRAND_COLORS[0],
    },
  ];

  // --- recentMentions[] ---
  const recentMentions = (result.mentions || []).map((m, i) => ({
    id: `m${i + 1}`,
    brandId: "brand_1",
    brandName: result.brand_name,
    platform: m.platform,
    query: m.query,
    response: m.response_snippet,
    mentionType: m.mention_type || "mention",
    sentiment: m.sentiment || "neutral",
    citationUrl: m.citation_url || null,
    hasCitation: !!m.citation_url,
    timestamp: now,
  }));

  // --- platformBreakdown[] ---
  const platformBreakdown = (result.platform_scores || []).map((ps) => ({
    platform: ps.platform,
    mentions: ps.mentions_found,
    citations: ps.citations,
    avgScore: Math.round(ps.score),
  }));

  // --- kpiSummary ---
  const activePrompts = result.top_queries?.length || 0;
  const kpiSummary = {
    totalBrands: 1,
    activeBrands: 1,
    totalMentionsThisWeek: totalMentions,
    mentionsChange: 0,
    totalCitationsThisWeek: totalCitations,
    citationsChange: 0,
    averageVisibilityScore: Math.round(result.visibility_score),
    scoreChange: 0,
    activePrompts,
    scheduledQueries: activePrompts,
  };

  // --- visibilityTrends[] ---
  const visibilityTrends = [
    { date: dateLabel, [result.brand_name]: Math.round(result.visibility_score) },
  ];

  // --- prompts[] ---
  const prompts = (result.top_queries || []).map((q, i) => ({
    id: `p${i + 1}`,
    query: q,
    category: "Generelt",
    platforms: ["chatgpt", "perplexity"],
    frequency: "daily",
    lastRun: now,
    isActive: true,
  }));

  // --- dailyAggregations[] ---
  const dailyAggregations = [
    {
      date: todayStr,
      totalMentions,
      totalCitations,
      avgScore: Math.round(result.visibility_score * 10) / 10,
    },
  ];

  // --- weeklyAggregations[] ---
  const weekNum = getISOWeek(new Date());
  const weeklyAggregations = [
    {
      week: `Uke ${weekNum}`,
      totalMentions,
      totalCitations,
      avgScore: Math.round(result.visibility_score * 10) / 10,
    },
  ];

  // --- competitors ---
  const competitors = [];

  return {
    brands,
    recentMentions,
    platformBreakdown,
    kpiSummary,
    visibilityTrends,
    prompts,
    dailyAggregations,
    weeklyAggregations,
    competitors,
  };
}

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
