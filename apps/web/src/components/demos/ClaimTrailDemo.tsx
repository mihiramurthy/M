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
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-mist-300 hover:border-signal/40"
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
        className="space-y-3 rounded-xl border border-white/10 bg-ink-800/50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setJob(analyzeClaim(url, claim));
        }}
      >
        <label className="block text-sm text-mist-400">
          URL
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label className="block text-sm text-mist-400">
          Claim
          <textarea
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            rows={3}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-ink-950"
        >
          Run provenance workers
        </button>
      </form>

      {job?.report && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink-800/50 p-4">
            <h3 className="font-display text-lg text-mist-50">Trust report</h3>
            <p
              className={`mt-2 font-mono text-2xl ${
                job.report.band === "elevated-caution"
                  ? "text-ember"
                  : job.report.band === "higher-confidence"
                    ? "text-signal"
                    : "text-mist-100"
              }`}
            >
              {job.report.score} · {job.report.band}
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-mist-400">
              {job.report.factors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-mist-400">{job.report.disclaimer}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-800/50 p-4">
            <h3 className="font-display text-lg text-mist-50">Event log</h3>
            <ul className="mt-3 space-y-1 font-mono text-[11px] text-mist-400">
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
