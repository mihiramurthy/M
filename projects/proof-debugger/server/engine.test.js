import { test } from "node:test";
import assert from "node:assert/strict";
import { checkProof, engineAvailable } from "./engine.js";

test("ocaml engine binary exists", () => {
  assert.equal(engineAvailable(), true);
});

test("valid MP proof passes", async () => {
  const r = await checkProof(`goal: Q
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: Q  [MP P1 P2]`);
  assert.equal(r.ok, true);
  assert.equal(r.goalReached, true);
  assert.equal(r.engine, "ocaml");
});

test("invalid MP stops at first error with pattern", async () => {
  const r = await checkProof(`goal: P
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: P  [MP P1 P2]`);
  assert.equal(r.ok, false);
  assert.equal(r.pattern, "modus_ponens_misapply");
  assert.equal(r.error.stepId, "S3");
  assert.match(r.error.message, /does not yield P/);
});
