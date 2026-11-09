import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { benchExample, listExamples, replayExample, runExample } from "./engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4800;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", async (_req, res) => {
  try {
    const examples = await listExamples();
    res.json({ ok: true, service: "concurrency-finder", engine: "c-dcf", ...examples });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

app.get("/api/examples", async (_req, res) => {
  try {
    res.json(await listExamples());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/run", async (req, res) => {
  try {
    const result = await runExample(req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/replay", async (req, res) => {
  try {
    const result = await replayExample(req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/bench", async (req, res) => {
  try {
    const result = await benchExample(req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`concurrency-finder on http://localhost:${PORT}`);
});
