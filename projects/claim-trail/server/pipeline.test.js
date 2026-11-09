import { test } from "node:test";
import assert from "node:assert/strict";
import { createJob, processJob } from "./pipeline.js";

test("young viral domain with absolutist claim scores into caution band", async () => {
  const job = createJob({
    url: "https://viral-share.test/post/1",
    claim: "BREAKING: you won't believe the entire Eastern grid failed last night",
  });
  await processJob(job);
  assert.equal(job.status, "completed");
  assert.ok(job.report.score <= 45);
  assert.equal(job.report.band, "elevated-caution");
  assert.ok(job.events.length >= 5);
});

test("established source with epistemic markers scores higher", async () => {
  const job = createJob({
    url: "https://reuters.com/world/example",
    claim: "According to methodology in a peer-reviewed dataset, outages were localized",
  });
  await processJob(job);
  assert.ok(job.report.score >= 70);
});
