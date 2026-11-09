"use client";

import { useState } from "react";
import { bench, runExample, type BenchStats, type RunResult } from "@/lib/demos/concurrencyFinder";

export function ConcurrencyFinderDemo() {
  const [example, setExample] = useState("bank_race");
  const [seed, setSeed] = useState(16);
  const [result, setResult] = useState<RunResult | null>(null);
  const [benchOut, setBenchOut] = useState<{
    summary: string;
    random: BenchStats;
    explore: BenchStats;
  } | null>(null);

  function onRun(mode: "random" | "explore") {
    setBenchOut(null);
    setResult(runExample(example, seed, mode));
  }

  function onBench() {
    const b = bench(example, 100, 1);
    setResult(null);
    setBenchOut(b);
  }

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-[#eef2f0] px-4 py-3 text-sm text-ink-muted">
        Portfolio demo uses a JS mirror of the controlled scheduler for Vercel. The
        authoritative engine is the <strong className="text-ink">C</strong> binary in{" "}
        <code>projects/concurrency-finder</code> (:4800).
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-ink-muted">
          Example
          <select
            className="ml-2 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-ink"
            value={example}
            onChange={(e) => setExample(e.target.value)}
          >
            <option value="bank_race">bank_race</option>
            <option value="lost_update">lost_update</option>
          </select>
        </label>
        <label className="text-sm text-ink-muted">
          Seed
          <input
            type="number"
            className="ml-2 w-24 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-ink"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value) || 1)}
          />
        </label>
        <button
          type="button"
          className="rounded-full bg-[#0f3d2e] px-4 py-1.5 text-sm font-semibold text-white"
          onClick={() => onRun("random")}
        >
          Run + shrink
        </button>
        <button
          type="button"
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm"
          onClick={() => onRun("explore")}
        >
          Explore mode
        </button>
        <button
          type="button"
          className="rounded-full border border-black/10 px-4 py-1.5 text-sm"
          onClick={onBench}
        >
          Benchmark vs random
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <pre className="min-h-40 overflow-auto rounded-2xl bg-[#0f1a16] p-4 font-mono text-xs text-[#b7d4c4]">
          {result
            ? `schedule: ${result.scheduleStr}\nids: [${result.schedule.join(", ")}]${
                result.minimal ? `\nminimal (${result.minimalLen}): [${result.minimal.join(", ")}]` : ""
              }`
            : benchOut
              ? JSON.stringify({ random: benchOut.random, explore: benchOut.explore }, null, 2)
              : "Run a seed to see the schedule."}
        </pre>

        <div
          className={`rounded-2xl border p-4 ${
            result?.ok
              ? "border-emerald-200 bg-emerald-50"
              : result
                ? "border-red-200 bg-red-50"
                : benchOut
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-black/5 bg-[#f7f4ef]"
          }`}
        >
          {!result && !benchOut && (
            <p className="text-ink-muted">Pick a seed and run the scheduler.</p>
          )}
          {result?.ok && (
            <>
              <h3 className="font-semibold text-emerald-800">✓ No bug in this schedule</h3>
              <p className="mt-2 text-sm">{result.message}</p>
            </>
          )}
          {result && !result.ok && (
            <>
              <h3 className="font-semibold text-red-800">✗ Bug: {result.bug}</h3>
              <p className="mt-2 text-sm">{result.message}</p>
              <p className="mt-2 font-mono text-xs text-ink-muted">
                seed={result.seed} · raw={result.schedule.length}
                {result.minimalLen != null ? ` · shrunk=${result.minimalLen}` : ""}
              </p>
            </>
          )}
          {benchOut && (
            <>
              <h3 className="font-semibold text-emerald-800">Benchmark</h3>
              <p className="mt-2 text-sm">{benchOut.summary}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between border-b border-black/5 py-1">
                  <span>Random stress</span>
                  <span className="font-mono text-xs">
                    {benchOut.random.bugsFound}/{benchOut.random.trials} · first@
                    {benchOut.random.firstBugTrial}
                  </span>
                </li>
                <li className="flex justify-between border-b border-black/5 py-1">
                  <span>Controlled explore</span>
                  <span className="font-mono text-xs">
                    {benchOut.explore.bugsFound}/{benchOut.explore.trials} · first@
                    {benchOut.explore.firstBugTrial}
                  </span>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
