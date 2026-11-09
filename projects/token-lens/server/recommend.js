import {
  CHEAPER_ALTERNATIVES,
  MODEL_CATALOG,
  estimateCost,
} from "./pricing.js";

/**
 * Recommend cheaper model when quality headroom suggests waste.
 * Evidence: complexity tier fit + observed quality vs cheaper ceiling.
 */
export function recommendRouting(record) {
  const model = record.model;
  const catalog = MODEL_CATALOG[model];
  if (!catalog) return null;

  const alts = CHEAPER_ALTERNATIVES[model] || [];
  if (!alts.length) return null;

  const complexity = record.complexity?.level;
  const quality = record.quality?.qualityScore ?? 0;
  const hall = record.quality?.hallucinationRisk ?? 1;

  // Waste signals: over-provisioned model for low complexity with solid quality
  const overProvisioned =
    (complexity === "trivial" || complexity === "simple") &&
    catalog.tier === "flagship" &&
    quality >= 0.7 &&
    hall <= 0.35;

  const moderateWaste =
    complexity === "moderate" &&
    catalog.tier === "flagship" &&
    quality >= 0.78 &&
    hall <= 0.28;

  if (!overProvisioned && !moderateWaste) {
    return {
      action: "keep",
      reason:
        "Quality/complexity profile does not justify downgrading — keep current model.",
      estimatedSavingsUsd: 0,
    };
  }

  // Pick cheapest alt whose qualityCeiling is within 0.08 of observed quality
  // or still above 0.7 for trivial tasks
  let chosen = null;
  for (const alt of [...alts].reverse()) {
    const c = MODEL_CATALOG[alt];
    if (!c) continue;
    const ok =
      c.qualityCeiling + 0.05 >= Math.min(quality, 0.85) ||
      (complexity === "trivial" && c.qualityCeiling >= 0.7);
    if (ok) chosen = alt;
  }
  if (!chosen) chosen = alts[0];

  const currentCost = record.costUsd || 0;
  const altCost = estimateCost(
    chosen,
    record.usage?.prompt_tokens || 0,
    record.usage?.completion_tokens || 0
  );
  const savings = Math.max(0, currentCost - altCost);

  return {
    action: "downgrade",
    from: model,
    to: chosen,
    reason: overProvisioned
      ? `Prompt classified ${complexity} with quality ${quality.toFixed(2)} / hall-risk ${hall.toFixed(2)} — flagship spend is likely waste.`
      : `Moderate task with strong quality (${quality.toFixed(2)}); efficient tier is evidence-backed.`,
    estimatedSavingsUsd: Number(savings.toFixed(6)),
    evidence: {
      complexity,
      qualityScore: quality,
      hallucinationRisk: hall,
      cheaperQualityCeiling: MODEL_CATALOG[chosen]?.qualityCeiling,
    },
  };
}

export function aggregateRecommendations(requests) {
  const byPair = new Map();
  let keep = 0;
  let downgrade = 0;
  let potentialSavings = 0;

  for (const r of requests) {
    const rec = r.recommendation;
    if (!rec) continue;
    if (rec.action === "keep") {
      keep += 1;
      continue;
    }
    downgrade += 1;
    potentialSavings += rec.estimatedSavingsUsd || 0;
    const key = `${rec.from}→${rec.to}`;
    const row = byPair.get(key) || {
      from: rec.from,
      to: rec.to,
      count: 0,
      savingsUsd: 0,
    };
    row.count += 1;
    row.savingsUsd += rec.estimatedSavingsUsd || 0;
    byPair.set(key, row);
  }

  return {
    keep,
    downgrade,
    potentialSavingsUsd: Number(potentialSavings.toFixed(4)),
    routes: [...byPair.values()]
      .map((r) => ({
        ...r,
        savingsUsd: Number(r.savingsUsd.toFixed(4)),
      }))
      .sort((a, b) => b.savingsUsd - a.savingsUsd),
  };
}
