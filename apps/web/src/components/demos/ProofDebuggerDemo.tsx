"use client";

import { useMemo, useState } from "react";
import { SAMPLES, checkProof } from "@/lib/demos/proofDebugger";

type Check = ReturnType<typeof checkProof>;

type Attempt = {
  id: number;
  studentId: string;
  exercise: string;
  ok: boolean;
  pattern: string;
};

export function ProofDebuggerDemo() {
  const [proof, setProof] = useState(SAMPLES.invalid);
  const [result, setResult] = useState<Check | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const clusters = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of attempts) {
      if (a.ok) continue;
      map.set(a.pattern, (map.get(a.pattern) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [attempts]);

  function runCheck(submit = false) {
    try {
      const r = checkProof(proof);
      setResult(r);
      if (submit) {
        setAttempts((prev) => [
          {
            id: Date.now(),
            studentId: "demo-student",
            exercise: "hw3-mp",
            ok: r.ok,
            pattern: r.ok ? "valid" : r.pattern,
          },
          ...prev,
        ].slice(0, 30));
      }
    } catch (err) {
      setResult({
        ok: false,
        engine: "js-mirror",
        pattern: "parse_error",
        stepsBeforeError: 0,
        error: {
          stepId: "?",
          rule: "parse",
          formula: "?",
          message: String((err as Error).message || err),
          hint: "Use: S1: P -> Q  [Premise]",
        },
        steps: [],
      });
    }
  }

  return (
    <div className="space-y-8">
      <p className="rounded-2xl bg-[#f7f4ef] px-4 py-3 text-sm text-ink-muted">
        Portfolio demo uses a JS mirror of the ND rules for Vercel. The authoritative
        verifier is the <strong className="text-ink">OCaml</strong> kernel in{" "}
        <code>projects/proof-debugger</code> (:4700).
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm"
              onClick={() => setProof(SAMPLES.valid)}
            >
              Load valid MP
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm"
              onClick={() => setProof(SAMPLES.invalid)}
            >
              Load broken MP
            </button>
            <button
              type="button"
              className="rounded-full bg-[#2f5d50] px-3 py-1.5 text-sm font-semibold text-white"
              onClick={() => runCheck(false)}
            >
              Check proof
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm"
              onClick={() => runCheck(true)}
            >
              Submit to TA cluster
            </button>
          </div>
          <textarea
            className="h-72 w-full rounded-2xl border border-black/10 bg-white p-4 font-mono text-xs leading-relaxed"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div
            className={`rounded-2xl border p-4 ${
              result?.ok
                ? "border-emerald-200 bg-emerald-50"
                : result
                  ? "border-red-200 bg-red-50"
                  : "border-black/5 bg-[#f7f4ef]"
            }`}
          >
            {!result && <p className="text-ink-muted">Run a check to see the kernel verdict.</p>}
            {result?.ok && (
              <>
                <h3 className="font-semibold text-emerald-800">✓ Proof accepted</h3>
                <p className="mt-1 font-mono text-xs">
                  engine={result.engine} · steps={result.stepsChecked} · goal=
                  {String(result.goalReached)}
                </p>
              </>
            )}
            {result && !result.ok && (
              <>
                <h3 className="font-semibold text-red-800">
                  ✗ First invalid inference at {result.error.stepId}
                </h3>
                <p className="mt-2 text-sm">
                  <strong>{result.error.formula}</strong> via <code>{result.error.rule}</code>
                </p>
                <p className="mt-2 text-sm">{result.error.message}</p>
                <p className="mt-2 text-xs text-ink-muted">{result.error.hint}</p>
                <p className="mt-2 font-mono text-xs">pattern={result.pattern}</p>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-4">
            <h3 className="font-semibold">TA pattern clusters</h3>
            {clusters.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Submit invalid attempts to populate clusters.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {clusters.map(([pattern, count]) => (
                  <li key={pattern} className="flex justify-between border-b border-black/5 py-1">
                    <span className="font-mono text-xs">{pattern}</span>
                    <span className="font-semibold text-red-700">{count}×</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
