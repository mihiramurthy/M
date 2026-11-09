"use client";

import { useMemo, useState } from "react";
import {
  buildPrepChecklist,
  matchClinics,
  type Profile,
} from "@/lib/demos/careAtlas";

export function CareAtlasDemo() {
  const [specialty, setSpecialty] = useState("primary");
  const [language, setLanguage] = useState("es");
  const [uninsured, setUninsured] = useState(true);
  const [medicaid, setMedicaid] = useState(false);
  const [maxMiles, setMaxMiles] = useState(25);
  const [selected, setSelected] = useState<string | null>(null);

  const profile: Profile = useMemo(
    () => ({
      lat: 38.9897,
      lon: -76.9378,
      uninsured,
      medicaid,
      incomeBand: uninsured ? "low" : "mid",
      languages: [language],
      specialty,
      maxMiles,
    }),
    [specialty, language, uninsured, medicaid, maxMiles]
  );

  const matches = matchClinics(profile).slice(0, 6);
  const clinic = matches.find((m) => m.clinic.id === selected)?.clinic ?? null;
  const prep = selected ? buildPrepChecklist(profile, clinic) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <form className="space-y-3 rounded-2xl bg-paper-soft p-4" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm text-ink-muted">
          Specialty
          <select
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-ink"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {["primary", "behavioral", "obgyn", "dental", "urgent"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-ink-muted">
          Language
          <select
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-ink"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {["en", "es", "am", "zh", "fr"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={uninsured} onChange={(e) => setUninsured(e.target.checked)} />
          Uninsured / low income
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={medicaid} onChange={(e) => setMedicaid(e.target.checked)} />
          Medicaid
        </label>
        <label className="block text-sm text-ink-muted">
          Max miles
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-ink"
            value={maxMiles}
            onChange={(e) => setMaxMiles(Number(e.target.value))}
          />
        </label>
      </form>

      <div className="space-y-3">
        {matches.map((m, i) => (
          <article key={m.clinic.id} className="rounded-2xl border border-black/5 bg-paper-soft p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">
                {i + 1}. {m.clinic.name}
              </h3>
              <span className="font-mono text-sm text-accent">score {m.score.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {m.distance.toFixed(1)} mi · {m.clinic.specialty} · ~${m.clinic.cashVisitEstimate} cash
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-ink-muted">
              {m.reasons.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 text-sm font-medium text-accent"
              onClick={() => setSelected(m.clinic.id)}
            >
              Build visit prep
            </button>
          </article>
        ))}
        {prep && (
          <div className="rounded-2xl border border-accent/30 bg-white p-4">
            <h3 className="text-lg font-semibold">Visit prep — {prep.clinicName}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {prep.items.map((item) => (
                <li key={item.id}>
                  {item.label}
                  {item.required ? <span className="ml-2 text-xs text-accent">required</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
