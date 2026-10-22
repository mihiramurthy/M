import express from "express";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  DEFAULT_LOADS,
  buildForecast,
  listRegions,
  planLoads,
} from "./grid.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4400);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "wattline" });
});

app.get("/api/regions", (_req, res) => res.json({ regions: listRegions() }));

app.get("/api/forecast", (req, res) => {
  const region = req.query.region || "midatlantic";
  res.json(buildForecast(String(region), 48));
});

app.post("/api/plan", (req, res) => {
  const region = req.body?.region || "midatlantic";
  const loads = Array.isArray(req.body?.loads) ? req.body.loads : DEFAULT_LOADS;
  const forecast = buildForecast(region, 48);
  const plan = planLoads(forecast, loads);
  res.json({ forecast, plan });
});

app.listen(port, () => {
  console.log(`Wattline listening on http://localhost:${port}`);
});
