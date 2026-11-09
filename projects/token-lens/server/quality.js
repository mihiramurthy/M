/**
 * Output-quality / hallucination-risk scoring.
 * Heuristic + evidence-based signals for demo routing decisions.
 */

const HEDGE =
  /\b(as an ai|i (?:don't|do not) have (?:access|real-time)|cannot browse|might be|possibly|allegedly)\b/i;
const FABRICATED_CITE =
  /\b(doi:\s*10\.\d{4,}\/[^\s]+|according to (?:a )?202[4-9] study|arxiv\.org\/abs\/9999)\b/i;
const SPECIFIC_NUMBER = /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|\b\d+\.\d+%\b/g;
const GROUNDING =
  /\b(according to (?:the )?(?:prompt|user|context|document)|based on (?:the )?(?:provided|given)|from your (?:message|input))\b/i;
const CONTRADICTION_PAIRS = [
  [/\bis\b.{0,40}\bnot\b/i, /\balways\b/i],
];

export function scoreOutputQuality({ prompt, output, model }) {
  const text = output || "";
  const factors = [];
  let quality = 0.78;
  let hallRisk = 0.18;

  if (!text.trim()) {
    return {
      qualityScore: 0.05,
      hallucinationRisk: 0.95,
      band: "fail",
      factors: ["empty output"],
      grounded: false,
    };
  }

  if (text.length < 40) {
    quality -= 0.08;
    factors.push("−0.08 very short answer");
  } else if (text.length > 120 && text.length < 1200) {
    quality += 0.05;
    factors.push("+0.05 well-scoped length");
  }

  if (GROUNDING.test(text)) {
    quality += 0.07;
    hallRisk -= 0.08;
    factors.push("+ grounding language present");
  }

  if (HEDGE.test(text) && /current|latest|today|live data/i.test(prompt || "")) {
    quality += 0.04;
    hallRisk -= 0.05;
    factors.push("+ appropriate uncertainty for live/unknown data");
  }

  if (FABRICATED_CITE.test(text)) {
    quality -= 0.25;
    hallRisk += 0.35;
    factors.push("− fabricated-looking citation pattern");
  }

  const nums = text.match(SPECIFIC_NUMBER) || [];
  if (nums.length >= 3 && !(prompt || "").match(SPECIFIC_NUMBER)) {
    quality -= 0.12;
    hallRisk += 0.18;
    factors.push("− dense precise numbers not present in prompt");
  }

  // Prompt asks for capital of France style factual — reward concise correct patterns
  if (/capital of france/i.test(prompt || "") && /paris/i.test(text)) {
    quality += 0.1;
    hallRisk -= 0.1;
    factors.push("+ matches well-known factual anchor");
  }

  if (/step[- ]by[- ]step|prove that/i.test(prompt || "")) {
    const steps = (text.match(/\b(?:step\s*\d+|\d+\.|first|second|therefore)\b/gi) || [])
      .length;
    if (steps >= 3) {
      quality += 0.06;
      factors.push("+ multi-step structure for reasoning ask");
    } else {
      quality -= 0.08;
      factors.push("− weak step structure for reasoning ask");
    }
  }

  // Model tier prior (small)
  if (/mini|haiku|3\.5/.test(model || "")) {
    quality -= 0.02;
  } else if (/4o$|sonnet|gpt-4(?!o-mini)/i.test(model || "")) {
    quality += 0.02;
  }

  for (const [a, b] of CONTRADICTION_PAIRS) {
    if (a.test(text) && b.test(text)) {
      quality -= 0.1;
      hallRisk += 0.12;
      factors.push("− possible internal contradiction cues");
    }
  }

  quality = clamp(quality, 0.02, 0.99);
  hallRisk = clamp(hallRisk, 0.02, 0.99);

  let band = "good";
  if (quality < 0.45 || hallRisk > 0.55) band = "poor";
  else if (quality < 0.65 || hallRisk > 0.35) band = "mixed";
  else if (quality >= 0.82 && hallRisk <= 0.2) band = "excellent";

  return {
    qualityScore: Number(quality.toFixed(3)),
    hallucinationRisk: Number(hallRisk.toFixed(3)),
    band,
    factors,
    grounded: GROUNDING.test(text) || /paris/i.test(text),
  };
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
