import assert from "assert/strict";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import test from "node:test";
import { benchExample, replayExample, runExample } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(__dirname, "..", "c", "dcf");

test("c binary exists", () => {
  const r = spawnSync(BIN, ["list"], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /bank_race/);
});

test("bank_race seed 16 finds negative balance and shrinks", async () => {
  const r = await runExample({ example: "bank_race", seed: 16, shrink: true });
  assert.equal(r.ok, false);
  assert.match(r.message, /balance=-50/);
  assert.ok(r.scheduleLen >= 4);
  assert.ok(r.minimalLen >= 1);
});

test("replay reproduces bug", async () => {
  const r = await replayExample({
    example: "bank_race",
    seed: 16,
    schedule: [0, 1, 0, 1],
  });
  assert.equal(r.ok, false);
});

test("bench: explore finds bugs at least as often as random", async () => {
  const b = await benchExample({ example: "bank_race", trials: 80, seed: 1 });
  assert.ok(b.explore.bugsFound >= b.random.bugsFound);
  assert.equal(b.explore.firstBugTrial, 1);
  assert.ok(b.random.firstBugTrial >= 1);
});
