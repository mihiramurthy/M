"use client";

import { useState } from "react";
import { PRESETS, analyzeClaim, type ClaimJob } from "@/lib/demos/claimTrail";

export function ClaimTrailDemo() {
  const [url, setUrl] = useState(PRESETS[0].url);
  const [claim, setClaim] = useState(PRESETS[0].claim);
  const [job, setJob] = useState<ClaimJob | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-soft hover:border-accent/40"
            onClick={() => {
              setUrl(p.url);
              setClaim(p.claim);
              setJob(null);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <form
        className="space-y-3 rounded-2xl bg-paper-soft p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setJob(analyzeClaim(url, claim));
        }}
      >
        <label className="block text-sm text-ink-muted">
          URL
          <input
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-ink"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-muted">
          Claim
          <textarea
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-ink"
            rows={3}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          Run provenance workers
        </button>
      </form>

      {job?.report && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-paper-soft p-4">
            <h3 className="text-lg font-semibold">Trust report</h3>
            <p
              className={`mt-2 font-mono text-2xl ${
                job.report.band === "elevated-caution"
                  ? "text-accent"
                  : job.report.band === "higher-confidence"
                    ? "text-emerald-700"
                    : "text-ink"
              }`}
            >
              {job.report.score} · {job.report.band}
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-ink-muted">
              {job.report.factors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-black/5 bg-paper-soft p-4">
            <h3 className="text-lg font-semibold">Event log</h3>
            <ul className="mt-3 space-y-1 font-mono text-[11px] text-ink-muted">
              {job.events.map((ev, i) => (
                <li key={i}>{ev.type}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
