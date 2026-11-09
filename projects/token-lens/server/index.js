import express from "express";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { handleAnthropicProxy, handleChatProxy } from "./proxy.js";
import { listRequests, overview } from "./store.js";
import { aggregateRecommendations } from "./recommend.js";
import { MODEL_CATALOG } from "./pricing.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4600);
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "token-lens",
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    mode: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY ? "hybrid" : "mock",
  });
});

app.get("/api/models", (_req, res) => res.json({ models: MODEL_CATALOG }));

app.get("/api/overview", (_req, res) => res.json(overview()));

app.get("/api/requests", (req, res) => {
  const limit = Number(req.query.limit || 80);
  const team = req.query.team ? String(req.query.team) : undefined;
  res.json({ requests: listRequests({ limit, team }) });
});

app.get("/api/recommendations", (_req, res) => {
  res.json(aggregateRecommendations(listRequests({ limit: 500 })));
});

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { response } = await handleChatProxy(req);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.post("/v1/messages", async (req, res) => {
  try {
    const { response } = await handleAnthropicProxy(req);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

/** Convenience playground endpoint used by the dashboard */
app.post("/api/playground", async (req, res) => {
  try {
    const { response, record } = await handleChatProxy({
      header: (n) => (n === "x-team-id" ? req.body?.teamId || "playground" : undefined),
      body: {
        model: req.body?.model || "gpt-4o",
        messages: [
          { role: "user", content: req.body?.prompt || "What is the capital of France?" },
        ],
      },
    });
    res.json({ response, record });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.listen(port, () => {
  console.log(`TokenLens listening on http://localhost:${port}`);
});
