/** Approximate USD per 1M tokens — demo rates, not vendor quotes. */
export const MODEL_CATALOG = {
  "gpt-4o": {
    provider: "openai",
    inputPerM: 2.5,
    outputPerM: 10,
    tier: "flagship",
    qualityCeiling: 0.92,
  },
  "gpt-4o-mini": {
    provider: "openai",
    inputPerM: 0.15,
    outputPerM: 0.6,
    tier: "efficient",
    qualityCeiling: 0.84,
  },
  "gpt-3.5-turbo": {
    provider: "openai",
    inputPerM: 0.5,
    outputPerM: 1.5,
    tier: "budget",
    qualityCeiling: 0.72,
  },
  "claude-3-5-sonnet": {
    provider: "anthropic",
    inputPerM: 3,
    outputPerM: 15,
    tier: "flagship",
    qualityCeiling: 0.93,
  },
  "claude-3-5-haiku": {
    provider: "anthropic",
    inputPerM: 0.8,
    outputPerM: 4,
    tier: "efficient",
    qualityCeiling: 0.82,
  },
  "claude-3-haiku": {
    provider: "anthropic",
    inputPerM: 0.25,
    outputPerM: 1.25,
    tier: "budget",
    qualityCeiling: 0.7,
  },
};

export const CHEAPER_ALTERNATIVES = {
  "gpt-4o": ["gpt-4o-mini", "gpt-3.5-turbo"],
  "gpt-4o-mini": ["gpt-3.5-turbo"],
  "claude-3-5-sonnet": ["claude-3-5-haiku", "claude-3-haiku"],
  "claude-3-5-haiku": ["claude-3-haiku"],
};

export function estimateCost(model, promptTokens, completionTokens) {
  const m = MODEL_CATALOG[model] || MODEL_CATALOG["gpt-4o-mini"];
  const cost =
    (promptTokens / 1e6) * m.inputPerM + (completionTokens / 1e6) * m.outputPerM;
  return Number(cost.toFixed(6));
}

export function normalizeModel(name = "") {
  const n = String(name).toLowerCase();
  if (n.includes("4o-mini") || n.includes("gpt-4o-mini")) return "gpt-4o-mini";
  if (n.includes("gpt-4o") || n.includes("gpt-4")) return "gpt-4o";
  if (n.includes("3.5")) return "gpt-3.5-turbo";
  if (n.includes("sonnet")) return "claude-3-5-sonnet";
  if (n.includes("3-5-haiku") || n.includes("3.5-haiku")) return "claude-3-5-haiku";
  if (n.includes("haiku")) return "claude-3-haiku";
  if (n.includes("claude")) return "claude-3-5-sonnet";
  return MODEL_CATALOG[name] ? name : "gpt-4o-mini";
}
