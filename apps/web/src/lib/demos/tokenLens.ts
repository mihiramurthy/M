export const MODEL_CATALOG: Record<
  string,
  { inputPerM: number; outputPerM: number; tier: string; qualityCeiling: number }
> = {
  "gpt-4o": { inputPerM: 2.5, outputPerM: 10, tier: "flagship", qualityCeiling: 0.92 },
  "gpt-4o-mini": { inputPerM: 0.15, outputPerM: 0.6, tier: "efficient", qualityCeiling: 0.84 },
  "gpt-3.5-turbo": { inputPerM: 0.5, outputPerM: 1.5, tier: "budget", qualityCeiling: 0.72 },
  "claude-3-5-sonnet": { inputPerM: 3, outputPerM: 15, tier: "flagship", qualityCeiling: 0.93 },
  "claude-3-5-haiku": { inputPerM: 0.8, outputPerM: 4, tier: "efficient", qualityCeiling: 0.82 },
};

const CHEAPER: Record<string, string[]> = {
  "gpt-4o": ["gpt-4o-mini", "gpt-3.5-turbo"],
  "gpt-4o-mini": ["gpt-3.5-turbo"],
  "claude-3-5-sonnet": ["claude-3-5-haiku"],
};

export function classifyComplexity(text: string) {
  const len = text.length;
  let score = len < 80 ? 0 : len < 220 ? 1 : len < 600 ? 2 : len < 900 ? 3 : 4;
  const reasons: string[] = [];
  if (/\b(prove|step[- ]by[- ]step|architecture|trade-?off)\b/i.test(text)) {
    score += 3;
    reasons.push("reasoning markers");
  }
  if (/\b(function|```|typescript|python)\b/i.test(text)) {
    score += 2;
    reasons.push("code markers");
  }
  if (/\b(must|constraint|requirements?:)\b/i.test(text)) {
    score += 2;
    reasons.push("multi-constraint");
  }
  let level = "trivial";
  if (score >= 8) level = "reasoning";
  else if (score >= 6) level = "complex";
  else if (score >= 4) level = "moderate";
  else if (score >= 2) level = "simple";
  return { level, score, reasons };
}

export function scoreOutputQuality(prompt: string, output: string, model: string) {
  let quality = 0.78;
  let hallRisk = 0.18;
  const factors: string[] = [];
  if (!output.trim()) {
    return { qualityScore: 0.05, hallucinationRisk: 0.95, band: "fail", factors: ["empty"] };
  }
  if (/based on the provided|according to the prompt/i.test(output)) {
    quality += 0.07;
    hallRisk -= 0.08;
    factors.push("+ grounding");
  }
  if (/doi:\s*10\.\d+\/|arxiv\.org\/abs\/9999/i.test(output)) {
    quality -= 0.25;
    hallRisk += 0.35;
    factors.push("− fabricated citation");
  }
  if (/capital of france/i.test(prompt) && /paris/i.test(output)) {
    quality += 0.1;
    hallRisk -= 0.1;
    factors.push("+ factual anchor");
  }
  if (/mini|haiku|3\.5/.test(model)) quality -= 0.02;
  quality = Math.max(0.02, Math.min(0.99, quality));
  hallRisk = Math.max(0.02, Math.min(0.99, hallRisk));
  const band =
    quality < 0.45 || hallRisk > 0.55
      ? "poor"
      : quality < 0.65 || hallRisk > 0.35
        ? "mixed"
        : quality >= 0.82 && hallRisk <= 0.2
          ? "excellent"
          : "good";
  return {
    qualityScore: Number(quality.toFixed(3)),
    hallucinationRisk: Number(hallRisk.toFixed(3)),
    band,
    factors,
  };
}

export function estimateCost(model: string, promptTokens: number, completionTokens: number) {
  const m = MODEL_CATALOG[model] || MODEL_CATALOG["gpt-4o-mini"];
  return Number(
    ((promptTokens / 1e6) * m.inputPerM + (completionTokens / 1e6) * m.outputPerM).toFixed(6)
  );
}

export function recommendRouting(input: {
  model: string;
  costUsd: number;
  complexity: { level: string };
  quality: { qualityScore: number; hallucinationRisk: number };
  usage: { prompt_tokens: number; completion_tokens: number };
}) {
  const catalog = MODEL_CATALOG[input.model];
  const alts = CHEAPER[input.model] || [];
  if (!catalog || !alts.length) {
    return { action: "keep" as const, reason: "No cheaper alternative mapped.", estimatedSavingsUsd: 0 };
  }
  const { level } = input.complexity;
  const q = input.quality.qualityScore;
  const h = input.quality.hallucinationRisk;
  const over =
    (level === "trivial" || level === "simple") &&
    catalog.tier === "flagship" &&
    q >= 0.7 &&
    h <= 0.35;
  if (!over) {
    return {
      action: "keep" as const,
      reason: "Quality/complexity profile does not justify downgrading.",
      estimatedSavingsUsd: 0,
    };
  }
  const to = alts[0];
  const altCost = estimateCost(to, input.usage.prompt_tokens, input.usage.completion_tokens);
  return {
    action: "downgrade" as const,
    from: input.model,
    to,
    reason: `Prompt classified ${level} with quality ${q.toFixed(2)}; flagship spend is likely waste.`,
    estimatedSavingsUsd: Number(Math.max(0, input.costUsd - altCost).toFixed(6)),
  };
}

export function mockComplete(model: string, prompt: string) {
  let content = `Mock ${model}: ${prompt.slice(0, 160)}`;
  if (/capital of france/i.test(prompt)) {
    content = "Based on the provided question: the capital of France is Paris.";
  } else if (/fake citation|arxiv/i.test(prompt)) {
    content =
      "According to a 2027 study (doi: 10.9999/fake-hallucination) productivity rose 482.7%.";
  } else if (/prove|step[- ]by[- ]step/i.test(prompt)) {
    content =
      "Step 1: Restate.\nStep 2: Assumptions.\nStep 3: Infer.\nTherefore the claim follows.";
  }
  const prompt_tokens = Math.max(8, Math.round(prompt.length / 4));
  const completion_tokens = Math.max(12, Math.round(content.length / 4));
  return {
    content,
    usage: {
      prompt_tokens,
      completion_tokens,
      total_tokens: prompt_tokens + completion_tokens,
    },
  };
}

export function runProxy(opts: { teamId: string; model: string; prompt: string }) {
  const complexity = classifyComplexity(opts.prompt);
  const completion = mockComplete(opts.model, opts.prompt);
  const quality = scoreOutputQuality(opts.prompt, completion.content, opts.model);
  const costUsd = estimateCost(
    opts.model,
    completion.usage.prompt_tokens,
    completion.usage.completion_tokens
  );
  const recommendation = recommendRouting({
    model: opts.model,
    costUsd,
    complexity,
    quality,
    usage: completion.usage,
  });
  return {
    teamId: opts.teamId,
    model: opts.model,
    output: completion.content,
    usage: completion.usage,
    costUsd,
    complexity,
    quality,
    recommendation,
  };
}
