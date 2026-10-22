import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { predictRisk } from "./infer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelPath = join(__dirname, "..", "model", "model.json");

test("high-nitrate near-ag site scores elevated", () => {
  const model = JSON.parse(readFileSync(modelPath, "utf8"));
  const result = predictRisk(model, {
    nitrate_mg_l: 24,
    ph: 6.1,
    turbidity_ntu: 12,
    ag_proximity_km: 0.3,
    industry_proximity_km: 1.0,
    well_depth_m: 15,
    rainfall_30d_mm: 90,
  });
  assert.ok(result.probability > 0.55);
  assert.equal(result.label, "elevated_risk");
});

test("deep clean well scores low", () => {
  const model = JSON.parse(readFileSync(modelPath, "utf8"));
  const result = predictRisk(model, {
    nitrate_mg_l: 1.2,
    ph: 7.3,
    turbidity_ntu: 0.8,
    ag_proximity_km: 18,
    industry_proximity_km: 22,
    well_depth_m: 80,
    rainfall_30d_mm: 40,
  });
  assert.ok(result.probability < 0.4);
});
