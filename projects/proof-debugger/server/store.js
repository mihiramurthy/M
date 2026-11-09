import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const dbPath = join(dataDir, "submissions.json");
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

let rows = load();

export function addSubmission({ studentId, exercise, proofText, result }) {
  const row = {
    id: nanoid(10),
    ts: new Date().toISOString(),
    studentId: studentId || "anonymous",
    exercise: exercise || "unspecified",
    proofText,
    ok: Boolean(result?.ok),
    pattern: result?.ok ? "valid" : result?.pattern || "unknown",
    error: result?.error || null,
    stepsBeforeError: result?.stepsBeforeError ?? null,
  };
  rows.unshift(row);
  if (rows.length > 400) rows = rows.slice(0, 400);
  save(rows);
  return row;
}

export function listRecent(limit = 40) {
  return rows.slice(0, limit);
}

export function clearAll() {
  rows = [];
  save(rows);
}

export function clusterMistakes() {
  const byPattern = new Map();
  for (const r of rows) {
    if (r.ok) continue;
    const key = r.pattern || "unknown";
    const bucket = byPattern.get(key) || {
      pattern: key,
      count: 0,
      examples: [],
      exercises: {},
    };
    bucket.count += 1;
    bucket.exercises[r.exercise] = (bucket.exercises[r.exercise] || 0) + 1;
    if (bucket.examples.length < 5) {
      bucket.examples.push({
        id: r.id,
        studentId: r.studentId,
        exercise: r.exercise,
        stepId: r.error?.stepId,
        message: r.error?.message,
        ts: r.ts,
      });
    }
    byPattern.set(key, bucket);
  }

  const clusters = [...byPattern.values()].sort((a, b) => b.count - a.count);
  const validCount = rows.filter((r) => r.ok).length;
  return {
    totalSubmissions: rows.length,
    validCount,
    invalidCount: rows.length - validCount,
    clusters,
  };
}
