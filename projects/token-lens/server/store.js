import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const dbPath = join(dataDir, "requests.json");

mkdirSync(dataDir, { recursive: true });

function load() {
  if (!existsSync(dbPath)) return [];
  try {
    return JSON.parse(readFileSync(dbPath, "utf8"));
  } catch {
    return [];
  }
}

function save(rows) {
  writeFileSync(dbPath, JSON.stringify(rows, null, 2));
}

let requests = load();

export function addRequest(row) {
  requests.unshift(row);
  if (requests.length > 500) requests = requests.slice(0, 500);
  save(requests);
  return row;
}

export function listRequests({ limit = 100, team } = {}) {
  let rows = requests;
  if (team) rows = rows.filter((r) => r.teamId === team);
  return rows.slice(0, limit);
}

export function clearRequests() {
  requests = [];
  save(requests);
}

export function overview() {
  const rows = requests;
  const byTeam = {};
  const byModel = {};
  const byComplexity = {};
  let totalCost = 0;
  let totalTokens = 0;
  let qualitySum = 0;
  let hallSum = 0;
  let wasteCount = 0;

  for (const r of rows) {
    totalCost += r.costUsd || 0;
    totalTokens += r.usage?.total_tokens || 0;
    qualitySum += r.quality?.qualityScore || 0;
    hallSum += r.quality?.hallucinationRisk || 0;
    if (r.recommendation?.action === "downgrade") wasteCount += 1;

    byTeam[r.teamId] = byTeam[r.teamId] || { teamId: r.teamId, costUsd: 0, requests: 0 };
    byTeam[r.teamId].costUsd += r.costUsd || 0;
    byTeam[r.teamId].requests += 1;

    byModel[r.model] = byModel[r.model] || { model: r.model, costUsd: 0, requests: 0 };
    byModel[r.model].costUsd += r.costUsd || 0;
    byModel[r.model].requests += 1;

    const level = r.complexity?.level || "unknown";
    byComplexity[level] = (byComplexity[level] || 0) + 1;
  }

  const n = rows.length || 1;
  return {
    requestCount: rows.length,
    totalCostUsd: Number(totalCost.toFixed(4)),
    totalTokens,
    avgQuality: Number((qualitySum / n).toFixed(3)),
    avgHallucinationRisk: Number((hallSum / n).toFixed(3)),
    wasteCount,
    byTeam: Object.values(byTeam)
      .map((t) => ({ ...t, costUsd: Number(t.costUsd.toFixed(4)) }))
      .sort((a, b) => b.costUsd - a.costUsd),
    byModel: Object.values(byModel)
      .map((t) => ({ ...t, costUsd: Number(t.costUsd.toFixed(4)) }))
      .sort((a, b) => b.costUsd - a.costUsd),
    byComplexity,
  };
}
