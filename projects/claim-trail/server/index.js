import express from "express";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createJob, processJob, pushEvent } from "./pipeline.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4200);
const jobs = new Map();
const metrics = {
  enqueued: 0,
  completed: 0,
  failed: 0,
  avgMs: 0,
};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

const PRESETS = [
  {
    id: "viral-grid",
    label: "Viral absolutist claim (young domain)",
    url: "https://viral-share.test/post/1",
    claim: "BREAKING: you won't believe the entire Eastern grid failed last night — share before it's deleted",
  },
  {
    id: "reuters-local",
    label: "Established wire with epistemic markers",
    url: "https://reuters.com/world/example",
    claim: "According to methodology in a peer-reviewed dataset, outages were localized to two substations",
  },
  {
    id: "thin-news",
    label: "Thin archive local blog",
    url: "https://example-news.test/story/grid-outage",
    claim: "The entire Eastern grid failed last night",
  },
];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "claim-trail", metrics });
});

app.get("/api/presets", (_req, res) => res.json({ presets: PRESETS }));


app.get("/api/metrics", (_req, res) => {
  res.json(metrics);
});

app.get("/api/jobs", (_req, res) => {
  res.json({ jobs: [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "not found" });
  res.json(job);
});

app.post("/api/jobs", async (req, res) => {
  const { url, claim } = req.body || {};
  if (!url && !claim) {
    return res.status(400).json({ error: "Provide url and/or claim" });
  }

  const job = createJob({ url, claim });
  jobs.set(job.id, job);
  metrics.enqueued += 1;
  pushEvent(job, "job.enqueued", { queueDepth: jobs.size });

  const started = Date.now();
  res.status(202).json({ id: job.id, status: job.status });

  try {
    await processJob(job);
    const elapsed = Date.now() - started;
    metrics.completed += 1;
    metrics.avgMs =
      metrics.avgMs === 0 ? elapsed : Math.round((metrics.avgMs + elapsed) / 2);
  } catch (err) {
    job.status = "failed";
    job.error = String(err);
    metrics.failed += 1;
    pushEvent(job, "job.failed", { error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`ClaimTrail listening on http://localhost:${port}`);
});
