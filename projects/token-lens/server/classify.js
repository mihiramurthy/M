/**
 * Prompt complexity classifier — heuristic, deterministic, explainable.
 * Levels: trivial | simple | moderate | complex | reasoning
 */

const REASONING_MARKERS =
  /\b(prove|derive|step[- ]by[- ]step|formal|theorem|optimize|trade-?off|compare and contrast|architecture|root cause|debug)\b/i;
const CODE_MARKERS =
  /\b(function|class |def |import |SELECT |```|typescript|python|ocaml|refactor)\b/i;
const MULTI_CONSTRAINT =
  /\b(must|constraint|requirements?:|accept(?:ance)? criteria|rubric)\b/i;
const LONG_CONTEXT = 900;

export function extractPromptText(messages = [], system = "") {
  const parts = [];
  if (system) parts.push(String(system));
  for (const m of messages) {
    if (!m) continue;
    if (typeof m.content === "string") parts.push(m.content);
    else if (Array.isArray(m.content)) {
      for (const c of m.content) {
        if (typeof c === "string") parts.push(c);
        else if (c?.text) parts.push(c.text);
      }
    }
  }
  return parts.join("\n");
}

export function classifyComplexity(promptText) {
  const text = promptText || "";
  const len = text.length;
  const reasons = [];
  let score = 0;

  if (len < 80) {
    score += 0;
    reasons.push("very short prompt");
  } else if (len < 220) {
    score += 1;
    reasons.push("short prompt");
  } else if (len < 600) {
    score += 2;
    reasons.push("medium-length prompt");
  } else if (len < LONG_CONTEXT) {
    score += 3;
    reasons.push("long prompt");
  } else {
    score += 4;
    reasons.push("very long / high-context prompt");
  }

  if (REASONING_MARKERS.test(text)) {
    score += 3;
    reasons.push("reasoning / analysis markers");
  }
  if (CODE_MARKERS.test(text)) {
    score += 2;
    reasons.push("code / technical markers");
  }
  if (MULTI_CONSTRAINT.test(text)) {
    score += 2;
    reasons.push("multi-constraint wording");
  }
  const qMarks = (text.match(/\?/g) || []).length;
  if (qMarks >= 3) {
    score += 1;
    reasons.push("multi-question prompt");
  }

  let level = "trivial";
  if (score >= 8) level = "reasoning";
  else if (score >= 6) level = "complex";
  else if (score >= 4) level = "moderate";
  else if (score >= 2) level = "simple";

  const recommendedTier =
    level === "trivial" || level === "simple"
      ? ["budget", "efficient"]
      : level === "moderate"
        ? ["efficient", "flagship"]
        : ["flagship"];

  return { level, score, reasons, recommendedTier, charCount: len };
}
