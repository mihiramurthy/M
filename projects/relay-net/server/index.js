import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { predictWindow } from "./infer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const model = JSON.parse(fs.readFileSync(path.join(ROOT, "model/model.json"), "utf8"));
const metrics = JSON.parse(fs.readFileSync(path.join(ROOT, "model/metrics.json"), "utf8"));
const examples = JSON.parse(fs.readFileSync(path.join(ROOT, "model/examples.json"), "utf8"));

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(ROOT, "public")));

app.get("/api/meta", (_req, res) => {
  res.json({
    name: model.name,
    channels: model.channels,
    classes: model.classes,
    timesteps: model.timesteps,
    metrics: {
      accuracy: metrics.accuracy,
      macro_f1: metrics.macro_f1,
      n_train: metrics.n_train,
      n_test: metrics.n_test,
      confusion_matrix: metrics.confusion_matrix,
    },
    examples: examples.map((e, i) => ({
      id: i,
      label: e.label,
    })),
  });
});

app.get("/api/example/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!examples[id]) return res.status(404).json({ error: "unknown example" });
  res.json(examples[id]);
});

app.post("/api/predict", (req, res) => {
  try {
    const window = req.body.window;
    const result = predictWindow(model, window);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err.message || err) });
  }
});

const port = Number(process.env.PORT || 4310);
app.listen(port, () => {
  console.log(`RelayNet demo on http://localhost:${port}`);
});
