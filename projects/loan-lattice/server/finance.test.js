import { test } from "node:test";
import assert from "node:assert/strict";
import { compareScenarios, runForbearanceTrap, runStandard } from "./finance.js";

test("standard 10-year pays down a typical balance", () => {
  const s = runStandard({ principal: 35000, annualRate: 0.055, months: 120 });
  assert.ok(s.months <= 120);
  assert.ok(s.endingBalance < 1);
  assert.ok(s.totalInterest > 0);
});

test("forbearance increases total interest vs immediate standard", () => {
  const input = { principal: 40000, annualRate: 0.06, pauseMonths: 12 };
  const std = runStandard(input);
  const fb = runForbearanceTrap(input);
  assert.ok(fb.interestCapitalized > 0);
  assert.ok(fb.totalInterest > std.totalInterest);
});

test("compare returns three scenarios", () => {
  const c = compareScenarios({
    principal: 45000,
    annualRate: 0.052,
    agi: 52000,
    familySize: 1,
  });
  assert.equal(c.scenarios.length, 3);
});
