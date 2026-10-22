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
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <form
        className="space-y-3 rounded-xl border border-white/10 bg-ink-800/60 p-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="block text-sm text-mist-400">
          Specialty
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {["primary", "behavioral", "obgyn", "dental", "urgent"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-mist-400">
          Language
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {["en", "es", "am", "zh", "fr"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-mist-300">
          <input
            type="checkbox"
            checked={uninsured}
            onChange={(e) => setUninsured(e.target.checked)}
          />
          Uninsured / low income
        </label>
        <label className="flex items-center gap-2 text-sm text-mist-300">
          <input
            type="checkbox"
            checked={medicaid}
            onChange={(e) => setMedicaid(e.target.checked)}
          />
          Medicaid
        </label>
        <label className="block text-sm text-mist-400">
          Max miles
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            value={maxMiles}
            onChange={(e) => setMaxMiles(Number(e.target.value))}
          />
        </label>
      </form>

      <div className="space-y-4">
        {matches.map((m, i) => (
          <article
            key={m.clinic.id}
            className="rounded-xl border border-white/10 bg-ink-800/40 p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg text-mist-50">
                {i + 1}. {m.clinic.name}
              </h3>
              <span className="font-mono text-sm text-signal">
                score {m.score.toFixed(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-mist-400">
              {m.distance.toFixed(1)} mi · {m.clinic.specialty} · ~$
              {m.clinic.cashVisitEstimate} cash · {m.clinic.phone}
            </p>
            <ul className="mt-2 list-disc pl-5 text-xs text-mist-400">
              {m.reasons.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 text-sm text-ember hover:underline"
              onClick={() => setSelected(m.clinic.id)}
            >
              Build visit prep
            </button>
          </article>
        ))}
        {prep && (
          <div className="rounded-xl border border-ember/30 bg-ink-800/60 p-4">
            <h3 className="font-display text-lg text-mist-50">
              Visit prep — {prep.clinicName}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-mist-300">
              {prep.items.map((item) => (
                <li key={item.id}>
                  {item.label}
                  {item.required ? (
                    <span className="ml-2 text-xs text-ember">required</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
