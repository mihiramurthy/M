import { test } from "node:test";
import assert from "node:assert/strict";
import { matchClinics, scoreClinic } from "./match.js";

const clinics = [
  {
    id: "a",
    name: "Sliding",
    specialty: "primary",
    lat: 38.99,
    lon: -76.94,
    languages: "en,es",
    slidingScale: 1,
    acceptsMedicaid: 1,
    waitDays: 5,
    transitAccess: 1,
    cashVisitEstimate: 40,
  },
  {
    id: "b",
    name: "Boutique",
    specialty: "primary",
    lat: 38.99,
    lon: -76.94,
    languages: "en",
    slidingScale: 0,
    acceptsMedicaid: 0,
    waitDays: 2,
    transitAccess: 0,
    cashVisitEstimate: 250,
  },
];

const profile = {
  lat: 38.9897,
  lon: -76.9378,
  uninsured: true,
  incomeBand: "low",
  languages: ["es"],
  specialty: "primary",
  maxMiles: 25,
};

test("sliding-scale clinic outranks boutique for uninsured profile", () => {
  const ranked = matchClinics(clinics, profile);
  assert.equal(ranked[0].clinic.id, "a");
  assert.ok(ranked[0].score > ranked[1].score);
});

test("out-of-radius clinics are excluded", () => {
  const far = scoreClinic(clinics[0], { ...profile, maxMiles: 0.01 });
  assert.equal(far.score, -1);
});
