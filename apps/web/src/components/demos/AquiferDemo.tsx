"use client";

import { useMemo, useState } from "react";
import { metrics, predictRisk, sites } from "@/lib/demos/aquifer";

const DEFAULTS: Record<string, number> = {
  nitrate_mg_l: 8,
  ph: 7.1,
  turbidity_ntu: 3,
  ag_proximity_km: 3,
  industry_proximity_km: 5,
  well_depth_m: 35,
  rainfall_30d_mm: 60,
};

export function AquiferDemo() {
  const [features, setFeatures] = useState(DEFAULTS);
  const pred = useMemo(() => predictRisk(features), [features]);
  const enriched = useMemo(
    () =>
      sites.map((s) => ({
        ...s,
        prediction: predictRisk(s.features),
      })),
    []
  );

  return (
    <div className="space-y-8">
      <p className="rounded-xl border border-white/10 bg-ink-800/50 px-4 py-3 font-mono text-xs text-mist-300">
        Offline eval · accuracy {(metrics.accuracy * 100).toFixed(1)}% · ROC-AUC{" "}
        {metrics.roc_auc.toFixed(3)} · Brier {metrics.brier.toFixed(3)} · n=
        {metrics.n_train}/{metrics.n_test}
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-display text-lg text-mist-50">What-if predictor</h3>
          {Object.keys(DEFAULTS).map((key) => (
            <label key={key} className="block text-xs text-mist-400">
              {key}
              <input
                type="number"
                step="any"
                className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-sm text-mist-50"
                value={features[key]}
                onChange={(e) =>
                  setFeatures((f) => ({ ...f, [key]: Number(e.target.value) }))
                }
              />
            </label>
          ))}
          <p
            className={`pt-2 font-mono text-lg ${
              pred.band === "high"
                ? "text-ember"
                : pred.band === "moderate"
                  ? "text-amber-300"
                  : "text-signal"
            }`}
          >
            {(pred.probability * 100).toFixed(1)}% · {pred.band} risk
          </p>
          <ul className="list-disc pl-5 text-xs text-mist-400">
            {pred.topDrivers.map((d) => (
              <li key={d.feature}>
                {d.feature}: {d.value.toFixed(2)} · contrib {d.contribution.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-lg text-mist-50">Monitoring sites</h3>
          {enriched.map((s) => (
            <button
              key={s.id}
              type="button"
              className="block w-full rounded-xl border border-white/10 bg-ink-800/40 p-3 text-left hover:border-signal/40"
              onClick={() => setFeatures({ ...s.features })}
            >
              <div className="flex justify-between gap-2">
                <span className="text-mist-50">{s.name}</span>
                <span className="font-mono text-xs text-signal">
                  {(s.prediction.probability * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-mist-400">{s.county}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
