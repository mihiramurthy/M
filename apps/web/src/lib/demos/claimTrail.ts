type WorkerResult = Record<string, unknown>;

const ARCHIVE_FIXTURES: Record<string, WorkerResult> = {
  "cdc.gov": { firstCaptureYear: 1995, captures: 8400, status: "stable" },
  "reuters.com": { firstCaptureYear: 1997, captures: 12000, status: "stable" },
  "example-news.test": { firstCaptureYear: 2024, captures: 3, status: "thin" },
  "viral-share.test": { firstCaptureYear: 2025, captures: 1, status: "new" },
  default: { firstCaptureYear: 2018, captures: 120, status: "moderate" },
};

const DOMAIN_FIXTURES: Record<string, WorkerResult> = {
  "cdc.gov": { ageDays: 11000, registrar: "ICANN", risk: "low" },
  "reuters.com": { ageDays: 10000, registrar: "MarkMonitor", risk: "low" },
  "example-news.test": { ageDays: 40, registrar: "BudgetDNS", risk: "high" },
  "viral-share.test": { ageDays: 12, registrar: "FastHost", risk: "high" },
  default: { ageDays: 900, registrar: "Unknown", risk: "medium" },
};

const URGENCY_PATTERNS = [
  { re: /\b(breaking|just in|you won't believe)\b/i, weight: 18, label: "urgency bait" },
  { re: /\b(share before|they don't want you|wake up)\b/i, weight: 22, label: "viral coercion" },
  { re: /\b(entire|all|100%|never|always)\b/i, weight: 10, label: "absolutist framing" },
  { re: /\b(according to|peer-reviewed|dataset|methodology)\b/i, weight: -12, label: "epistemic markers" },
];

export const PRESETS = [
  {
    id: "viral-grid",
    label: "Viral absolutist claim (young domain)",
    url: "https://viral-share.test/post/1",
    claim:
      "BREAKING: you won't believe the entire Eastern grid failed last night — share before it's deleted",
  },
  {
    id: "reuters-local",
    label: "Established wire with epistemic markers",
    url: "https://reuters.com/world/example",
    claim:
      "According to methodology in a peer-reviewed dataset, outages were localized to two substations",
  },
  {
    id: "thin-news",
    label: "Thin archive local blog",
    url: "https://example-news.test/story/grid-outage",
    claim: "The entire Eastern grid failed last night",
  },
];

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export type ClaimJob = {
  id: string;
  url: string | null;
  claim: string;
  workers: {
    archive?: WorkerResult;
    domain?: WorkerResult;
    agreement?: WorkerResult;
    urgency?: WorkerResult;
  };
  events: { type: string; detail: unknown }[];
  report: {
    score: number;
    band: string;
    factors: string[];
    disclaimer: string;
  } | null;
};

export function analyzeClaim(url: string, claim: string): ClaimJob {
  const id = `job_${Math.random().toString(36).slice(2, 10)}`;
  const host = hostnameOf(url || "");
  const events: ClaimJob["events"] = [];
  const workers: ClaimJob["workers"] = {};

  workers.archive = { host, ...(ARCHIVE_FIXTURES[host] || ARCHIVE_FIXTURES.default) };
  events.push({ type: "worker.archive.done", detail: workers.archive });

  workers.domain = { host, ...(DOMAIN_FIXTURES[host] || DOMAIN_FIXTURES.default) };
  events.push({ type: "worker.domain.done", detail: workers.domain });

  const text = `${claim} ${url || ""}`.toLowerCase();
  let corroborations = 0;
  let contradictions = 0;
  if (/cdc\.gov|reuters\.com|nih\.gov/.test(text)) corroborations += 2;
  if (/entire .+ failed|secret cure|microchip/.test(text)) contradictions += 2;
  if (/grid outage|blackout/.test(text)) {
    corroborations += 1;
    contradictions += 1;
  }
  workers.agreement = {
    corroborations,
    contradictions,
    sourcesChecked: ["mock-factcheck-a", "mock-wire-b", "mock-local-c"],
  };
  events.push({ type: "worker.agreement.done", detail: workers.agreement });

  const hits: string[] = [];
  let pressure = 0;
  for (const p of URGENCY_PATTERNS) {
    if (p.re.test(claim)) {
      hits.push(p.label);
      pressure += p.weight;
    }
  }
  workers.urgency = { pressure, hits };
  events.push({ type: "worker.urgency.done", detail: workers.urgency });

  let score = 55;
  const factors: string[] = [];
  const archive = workers.archive as { status: string };
  const domain = workers.domain as { ageDays: number; risk: string };
  const agreement = workers.agreement as {
    corroborations: number;
    contradictions: number;
  };
  const urgency = workers.urgency as { pressure: number };

  if (archive.status === "stable") {
    score += 15;
    factors.push("+15 stable archive history");
  } else if (archive.status === "thin") {
    score -= 10;
    factors.push("−10 thin archive history");
  } else if (archive.status === "new") {
    score -= 18;
    factors.push("−18 brand-new / sparse archive");
  }
  if (domain.ageDays > 3650) {
    score += 12;
    factors.push("+12 mature domain");
  } else if (domain.ageDays < 90) {
    score -= 20;
    factors.push("−20 very young domain");
  }
  if (domain.risk === "high") {
    score -= 8;
    factors.push("−8 high-risk registrar profile");
  }
  score += agreement.corroborations * 8;
  score -= agreement.contradictions * 12;
  if (agreement.corroborations) factors.push(`+${agreement.corroborations * 8} corroborations`);
  if (agreement.contradictions) factors.push(`−${agreement.contradictions * 12} contradictions`);
  score -= Math.max(0, urgency.pressure);
  if (urgency.pressure > 0) factors.push(`−${urgency.pressure} linguistic pressure`);
  if (urgency.pressure < 0) factors.push(`+${Math.abs(urgency.pressure)} epistemic markers`);

  score = Math.max(0, Math.min(100, score));
  let band = "mixed";
  if (score >= 75) band = "higher-confidence";
  else if (score <= 40) band = "elevated-caution";

  return {
    id,
    url: url || null,
    claim,
    workers,
    events,
    report: {
      score,
      band,
      factors,
      disclaimer:
        "Heuristic provenance score for demo — not a factual verdict. Always verify with primary sources.",
    },
  };
}
