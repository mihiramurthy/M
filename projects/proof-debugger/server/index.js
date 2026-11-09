import express from "express";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { checkProof, engineAvailable } from "./engine.js";
import { informalToFormal } from "./informal.js";
import {
  addSubmission,
  clusterMistakes,
  listRecent,
} from "./store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4700);
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "proof-debugger",
    ocamlEngine: engineAvailable(),
    llmAssist: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.post("/api/check", async (req, res) => {
  try {
    const proofText = String(req.body?.proof || "");
    const result = await checkProof(proofText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

app.post("/api/informal", async (req, res) => {
  try {
    const out = await informalToFormal(req.body?.text || "");
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.post("/api/submit", async (req, res) => {
  try {
    const proofText = String(req.body?.proof || "");
    const result = await checkProof(proofText);
    const row = addSubmission({
      studentId: req.body?.studentId,
      exercise: req.body?.exercise,
      proofText,
      result,
    });
    res.json({ submission: row, result });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.get("/api/ta/clusters", (_req, res) => {
  res.json(clusterMistakes());
});

app.get("/api/ta/recent", (req, res) => {
  res.json({ submissions: listRecent(Number(req.query.limit || 40)) });
});

app.listen(port, () => {
  console.log(`Proof Debugger listening on http://localhost:${port}`);
  console.log(`OCaml engine: ${engineAvailable() ? "ready" : "MISSING — npm run build:ocaml"}`);
});
