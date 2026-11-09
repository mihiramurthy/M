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
    () => sites.map((s) => ({ ...s, prediction: predictRisk(s.features) })),
    []
  );

  return (
    <div className="space-y-8">
      <p className="rounded-2xl bg-paper-soft px-4 py-3 font-mono text-xs text-ink-muted">
        Offline eval · accuracy {(metrics.accuracy * 100).toFixed(1)}% · ROC-AUC{" "}
        {metrics.roc_auc.toFixed(3)} · Brier {metrics.brier.toFixed(3)}
      </p>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">What-if predictor</h3>
          {Object.keys(DEFAULTS).map((key) => (
            <label key={key} className="block text-xs text-ink-muted">
              {key}
              <input
                type="number"
                step="any"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink"
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
                ? "text-accent"
                : pred.band === "moderate"
                  ? "text-amber-700"
                  : "text-emerald-700"
            }`}
          >
            {(pred.probability * 100).toFixed(1)}% · {pred.band} risk
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Monitoring sites</h3>
          {enriched.map((s) => (
            <button
              key={s.id}
              type="button"
              className="block w-full rounded-2xl border border-black/5 bg-paper-soft p-3 text-left hover:border-accent/40"
              onClick={() => setFeatures({ ...s.features })}
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium">{s.name}</span>
                <span className="font-mono text-xs text-accent">
                  {(s.prediction.probability * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-ink-muted">{s.county}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
