import { test } from "node:test";
import assert from "node:assert/strict";
import { buildForecast, planLoads, DEFAULT_LOADS } from "./grid.js";

test("forecast has 48 hourly points with positive intensity", () => {
  const f = buildForecast("midatlantic", 48);
  assert.equal(f.series.length, 48);
  assert.ok(f.series.every((p) => p.gCo2PerKwh >= 80));
});

test("planner saves emissions vs evening naive schedule", () => {
  const f = buildForecast("pacific", 48);
  const plan = planLoads(f, DEFAULT_LOADS);
  assert.ok(plan.totals.savedKg >= 0);
  assert.equal(plan.placements.length, DEFAULT_LOADS.length);
});
