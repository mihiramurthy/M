import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { predictWindow } from "./infer.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const model = JSON.parse(fs.readFileSync(path.join(ROOT, "model/model.json"), "utf8"));
const examples = JSON.parse(fs.readFileSync(path.join(ROOT, "model/examples.json"), "utf8"));

test("predictWindow returns a known class for each demo example", () => {
  for (const ex of examples) {
    const out = predictWindow(model, ex.window);
    assert.ok(model.classes.includes(out.label));
    assert.ok(out.confidence > 0.2);
    assert.equal(Object.keys(out.probabilities).length, model.classes.length);
  }
});

test("rejects wrong window length", () => {
  assert.throws(() => predictWindow(model, [[1, 2]]), /Expected window length/);
});
