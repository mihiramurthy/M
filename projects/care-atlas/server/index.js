import express from "express";
import cors from "cors";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { matchClinics, buildPrepChecklist } from "./match.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "..", "data", "clinics.json");
const port = Number(process.env.PORT || 4100);

if (!existsSync(dataPath)) {
  console.error("Data missing. Run: npm run seed");
  process.exit(1);
}

const { clinics } = JSON.parse(readFileSync(dataPath, "utf8"));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "care-atlas", version: "1.0.0" });
});

app.get("/api/clinics", (_req, res) => {
  res.json({ count: clinics.length, clinics });
});

app.post("/api/match", (req, res) => {
  const profile = {
    zip: req.body.zip ?? "20740",
    lat: Number(req.body.lat ?? 38.9897),
    lon: Number(req.body.lon ?? -76.9378),
    uninsured: Boolean(req.body.uninsured),
    medicaid: Boolean(req.body.medicaid),
    incomeBand: req.body.incomeBand ?? "low",
    languages: Array.isArray(req.body.languages) ? req.body.languages : ["en"],
    specialty: req.body.specialty ?? "primary",
    maxMiles: Number(req.body.maxMiles ?? 25),
  };

  const matches = matchClinics(clinics, profile).slice(0, 8);
  res.json({ profile, matches });
});

app.post("/api/prep", (req, res) => {
  const clinic = clinics.find((c) => c.id === req.body.clinicId) ?? null;
  const profile = req.body.profile ?? { uninsured: true, incomeBand: "low" };
  res.json(buildPrepChecklist(profile, clinic));
});

/** Side-by-side: how sliding-scale vs boutique ranks for the same profile */
app.post("/api/explain", (req, res) => {
  const profile = {
    zip: req.body.zip ?? "20740",
    lat: Number(req.body.lat ?? 38.9897),
    lon: Number(req.body.lon ?? -76.9378),
    uninsured: Boolean(req.body.uninsured ?? true),
    medicaid: Boolean(req.body.medicaid),
    incomeBand: req.body.incomeBand ?? "low",
    languages: Array.isArray(req.body.languages) ? req.body.languages : ["en"],
    specialty: req.body.specialty ?? "primary",
    maxMiles: Number(req.body.maxMiles ?? 25),
  };
  const matches = matchClinics(clinics, profile);
  const top = matches[0] ?? null;
  const boutique = matches.find((m) => !m.clinic.slidingScale) ?? null;
  res.json({
    profile,
    topPick: top,
    contrast: boutique,
    narrative: top
      ? `${top.clinic.name} leads because ${top.reasons.slice(0, 3).join("; ")}.`
      : "No clinics in radius — widen max miles or change specialty.",
  });
});

app.listen(port, () => {
  console.log(`CareAtlas listening on http://localhost:${port}`);
});

