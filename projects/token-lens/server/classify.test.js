import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyComplexity } from "./classify.js";
import { scoreOutputQuality } from "./quality.js";
import { recommendRouting } from "./recommend.js";

test("short greeting is trivial/simple", () => {
  const c = classifyComplexity("hi");
  assert.ok(c.level === "trivial" || c.level === "simple");
});

test("proof prompt ranks as complex/reasoning", () => {
  const c = classifyComplexity(
    "Prove step-by-step that if n is even then n^2 is even. Constraints: formal structure and acceptance criteria."
  );
  assert.ok(c.level === "complex" || c.level === "reasoning");
});

test("factual Paris answer scores well", () => {
  const q = scoreOutputQuality({
    prompt: "What is the capital of France?",
    output: "Based on the provided question: the capital of France is Paris.",
    model: "gpt-4o",
  });
  assert.ok(q.qualityScore >= 0.7);
  assert.ok(q.hallucinationRisk <= 0.35);
});

test("fake citation raises hallucination risk", () => {
  const q = scoreOutputQuality({
    prompt: "Cite research",
    output: "According to a 2027 study (doi: 10.9999/fake-hallucination) productivity rose 482.7%.",
    model: "gpt-4o",
  });
  assert.ok(q.hallucinationRisk >= 0.4);
});

test("flagship on trivial prompt recommends downgrade", () => {
  const rec = recommendRouting({
    model: "gpt-4o",
    costUsd: 0.002,
    usage: { prompt_tokens: 20, completion_tokens: 30 },
    complexity: { level: "trivial" },
    quality: { qualityScore: 0.88, hallucinationRisk: 0.12 },
  });
  assert.equal(rec.action, "downgrade");
  assert.ok(rec.to);
});
