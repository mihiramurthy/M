import express from "express";
import cors from "cors";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { bandFor, predictRisk } from "./infer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelDir = join(__dirname, "..", "model");
const port = Number(process.env.PORT || 4300);

for (const f of ["model.json", "metrics.json", "sites.json"]) {
  if (!existsSync(join(modelDir, f))) {
    console.error(`Missing model/${f}. Run: npm run train`);
    process.exit(1);
  }
}

const model = JSON.parse(readFileSync(join(modelDir, "model.json"), "utf8"));
const metrics = JSON.parse(readFileSync(join(modelDir, "metrics.json"), "utf8"));
const { sites } = JSON.parse(readFileSync(join(modelDir, "sites.json"), "utf8"));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "aquifer-net", features: model.features });
});

app.get("/api/metrics", (_req, res) => res.json(metrics));

app.get("/api/sites", (_req, res) => {
  const enriched = sites.map((s) => {
    const pred = predictRisk(model, s.features);
    return { ...s, prediction: { ...pred, band: bandFor(pred.probability) } };
  });
  res.json({ sites: enriched });
});

app.post("/api/predict", (req, res) => {
  try {
    const pred = predictRisk(model, req.body || {});
    res.json({ ...pred, band: bandFor(pred.probability) });
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

app.listen(port, () => {
  console.log(`AquiferNet listening on http://localhost:${port}`);
});
