"use client";

import { useMemo, useState } from "react";
import { artifact, examples, metrics, predictWindow } from "@/lib/demos/relayNet";

function Spark({ values }: { values: number[] }) {
  const w = 560;
  const h = 140;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1e-6);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 20) + 10;
      const y = h - 12 - ((v - min) / span) * (h - 24);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full rounded-xl bg-paper-soft">
      <polyline fill="none" stroke="#2f6f62" strokeWidth="2.6" points={pts} />
    </svg>
  );
}

export function RelayNetDemo() {
  const [exampleId, setExampleId] = useState(0);
  const [channel, setChannel] = useState(0);
  const ex = examples[exampleId];
  const pred = useMemo(() => predictWindow(ex.window), [ex]);
  const series = ex.window.map((row) => row[channel]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        <span className="rounded-full bg-paper-soft px-3 py-1">
          acc {(metrics.accuracy * 100).toFixed(1)}%
        </span>
        <span className="rounded-full bg-paper-soft px-3 py-1">
          macro F1 {(metrics.macro_f1 * 100).toFixed(1)}%
        </span>
        <span className="rounded-full bg-paper-soft px-3 py-1">train {metrics.n_train}</span>
        <span className="rounded-full bg-paper-soft px-3 py-1">test {metrics.n_test}</span>
        <span className="rounded-full bg-paper-soft px-3 py-1">TensorFlow Conv1D</span>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-float">
          <p className="text-sm text-ink-muted">Golden signal window</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
              value={exampleId}
              onChange={(e) => setExampleId(Number(e.target.value))}
            >
              {examples.map((e, i) => (
                <option key={i} value={i}>
                  Example {i + 1} · true {e.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm"
              value={channel}
              onChange={(e) => setChannel(Number(e.target.value))}
            >
              {artifact.channels.map((c, i) => (
                <option key={c} value={i}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <Spark values={series} />
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            True label <span className="font-semibold text-ink">{ex.label}</span>
          </p>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-float">
          <p className="text-sm text-ink-muted">Model output</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{pred.label}</p>
          <p className="text-sm text-ink-muted">
            confidence {(pred.confidence * 100).toFixed(1)}%
          </p>
          <div className="mt-5 space-y-2">
            {artifact.classes.map((c) => {
              const p = pred.probabilities[c] ?? 0;
              return (
                <div key={c} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                  <span>{c}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-soft">
                    <div
                      className={`h-full rounded-full ${c === "healthy" ? "bg-section-projects" : "bg-section-past"}`}
                      style={{ width: `${(p * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <span className="text-right font-mono text-xs">{(p * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-ink-muted">Top channel energy</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {pred.topChannels.map((c) => (
              <li key={c.channel}>
                {c.channel} · {c.energy.toFixed(2)}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
