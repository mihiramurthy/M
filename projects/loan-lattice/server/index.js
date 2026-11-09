import express from "express";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { compareScenarios } from "./finance.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4500);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "loan-lattice" });
});

app.post("/api/simulate", (req, res) => {
  const principal = Number(req.body?.principal ?? 40000);
  const annualRate = Number(req.body?.annualRate ?? 0.055);
  const agi = Number(req.body?.agi ?? 48000);
  const familySize = Number(req.body?.familySize ?? 1);
  const pauseMonths = Number(req.body?.pauseMonths ?? 12);

  if (!(principal > 0) || !(annualRate >= 0) || !(agi >= 0)) {
    return res.status(400).json({ error: "Invalid inputs" });
  }

  const result = compareScenarios({
    principal,
    annualRate,
    agi,
    familySize,
    pauseMonths,
  });
  res.json(result);
});

app.listen(port, () => {
  console.log(`LoanLattice listening on http://localhost:${port}`);
});
