import { nanoid } from "nanoid";

/** Deterministic mock fixtures keyed by hostname / claim keywords */
const ARCHIVE_FIXTURES = {
  "cdc.gov": { firstCaptureYear: 1995, captures: 8400, status: "stable" },
  "reuters.com": { firstCaptureYear: 1997, captures: 12000, status: "stable" },
  "example-news.test": { firstCaptureYear: 2024, captures: 3, status: "thin" },
  "viral-share.test": { firstCaptureYear: 2025, captures: 1, status: "new" },
  default: { firstCaptureYear: 2018, captures: 120, status: "moderate" },
};

const DOMAIN_FIXTURES = {
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

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function createJob({ url, claim }) {
  return {
    id: nanoid(10),
    url: url || null,
    claim: claim || "",
    status: "queued",
    createdAt: new Date().toISOString(),
    events: [],
    workers: {},
    report: null,
  };
}

export function pushEvent(job, type, detail) {
  job.events.push({ at: new Date().toISOString(), type, detail });
}

export async function runArchiveWorker(job) {
  const host = hostnameOf(job.url || "");
  const fixture = ARCHIVE_FIXTURES[host] || ARCHIVE_FIXTURES.default;
  await delay(40);
  job.workers.archive = { host, ...fixture };
  pushEvent(job, "worker.archive.done", fixture);
  return fixture;
}

export async function runDomainWorker(job) {
  const host = hostnameOf(job.url || "");
  const fixture = DOMAIN_FIXTURES[host] || DOMAIN_FIXTURES.default;
  await delay(35);
  job.workers.domain = { host, ...fixture };
  pushEvent(job, "worker.domain.done", fixture);
  return fixture;
}

export async function runAgreementWorker(job) {
  const text = `${job.claim} ${job.url || ""}`.toLowerCase();
  let corroborations = 0;
  let contradictions = 0;
  if (/cdc\.gov|reuters\.com|nih\.gov/.test(text)) corroborations += 2;
  if (/entire .+ failed|secret cure|microchip/.test(text)) contradictions += 2;
  if (/grid outage|blackout/.test(text)) {
    corroborations += 1;
    contradictions += 1;
  }
  const result = {
    corroborations,
    contradictions,
    sourcesChecked: ["mock-factcheck-a", "mock-wire-b", "mock-local-c"],
  };
  await delay(45);
  job.workers.agreement = result;
  pushEvent(job, "worker.agreement.done", result);
  return result;
}

export async function runUrgencyWorker(job) {
  const text = job.claim || "";
  const hits = [];
  let pressure = 0;
  for (const p of URGENCY_PATTERNS) {
    if (p.re.test(text)) {
      hits.push(p.label);
      pressure += p.weight;
    }
  }
  const result = { pressure, hits };
  await delay(25);
  job.workers.urgency = result;
  pushEvent(job, "worker.urgency.done", result);
  return result;
}

export function scoreTrust(job) {
  let score = 55;
  const factors = [];
  const { archive, domain, agreement, urgency } = job.workers;

  if (archive) {
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
  }

  if (domain) {
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
  }

  if (agreement) {
    score += agreement.corroborations * 8;
    score -= agreement.contradictions * 12;
    if (agreement.corroborations)
      factors.push(`+${agreement.corroborations * 8} corroborations`);
    if (agreement.contradictions)
      factors.push(`−${agreement.contradictions * 12} contradictions`);
  }

  if (urgency) {
    score -= Math.max(0, urgency.pressure);
    if (urgency.pressure > 0)
      factors.push(`−${urgency.pressure} linguistic pressure`);
    if (urgency.pressure < 0)
      factors.push(`+${Math.abs(urgency.pressure)} epistemic markers`);
  }

  score = Math.max(0, Math.min(100, score));
  let band = "mixed";
  if (score >= 75) band = "higher-confidence";
  else if (score <= 40) band = "elevated-caution";

  return {
    score,
    band,
    factors,
    disclaimer:
      "Heuristic provenance score for demo — not a factual verdict. Always verify with primary sources.",
  };
}

export async function processJob(job) {
  job.status = "running";
  pushEvent(job, "job.started", { id: job.id });

  await Promise.all([
    runArchiveWorker(job),
    runDomainWorker(job),
    runAgreementWorker(job),
    runUrgencyWorker(job),
  ]);

  job.report = scoreTrust(job);
  job.status = "completed";
  job.completedAt = new Date().toISOString();
  pushEvent(job, "job.completed", job.report);
  return job;
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
