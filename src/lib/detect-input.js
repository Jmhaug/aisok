/**
 * Classifies user input as url, brand_name, or prompt.
 * Returns { type: "url" | "brand_name" | "prompt", value: string }
 */
export function classifyInput(raw) {
  const value = (raw || "").trim();
  if (!value) return { type: "brand_name", value };

  // URL: starts with http(s):// or has a dot followed by a TLD-like segment
  if (/^https?:\/\//i.test(value) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(value)) {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return { type: "url", value: url };
  }

  // Prompt: 3+ words (likely a search query / sentence)
  const wordCount = value.split(/\s+/).length;
  if (wordCount >= 3) {
    return { type: "prompt", value };
  }

  // Default: brand name (1-2 words like "DNB", "Nordea Norge")
  return { type: "brand_name", value };
}
