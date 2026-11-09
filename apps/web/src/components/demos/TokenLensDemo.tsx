"use client";

import { useMemo, useState } from "react";
import { runProxy } from "@/lib/demos/tokenLens";

type Row = ReturnType<typeof runProxy> & { id: number; ts: string };

const SEED: { teamId: string; model: string; prompt: string }[] = [
  { teamId: "platform", model: "gpt-4o", prompt: "What is the capital of France?" },
  { teamId: "platform", model: "gpt-4o", prompt: "hi" },
  {
    teamId: "research",
    model: "claude-3-5-sonnet",
    prompt: "Prove step-by-step that if n is even then n^2 is even. Constraints: formal structure.",
  },
  {
    teamId: "research",
    model: "gpt-4o",
    prompt: "Cite a fake citation arxiv paper about overnight productivity.",
  },
  {
    teamId: "growth",
    model: "gpt-4o-mini",
    prompt: "Write a friendly 2-sentence onboarding email for a SaaS trial user.",
  },
];

export function TokenLensDemo() {
  const [teamId, setTeamId] = useState("platform");
  const [model, setModel] = useState("gpt-4o");
  const [prompt, setPrompt] = useState("What is the capital of France?");
  const [rows, setRows] = useState<Row[]>(() =>
    SEED.map((s, i) => ({
      ...runProxy(s),
      id: i + 1,
      ts: new Date(Date.now() - (SEED.length - i) * 60000).toISOString(),
    }))
  );

  const stats = useMemo(() => {
    const totalCost = rows.reduce((s, r) => s + r.costUsd, 0);
    const waste = rows.filter((r) => r.recommendation.action === "downgrade").length;
    const avgQ =
      rows.reduce((s, r) => s + r.quality.qualityScore, 0) / Math.max(1, rows.length);
    const byTeam: Record<string, number> = {};
    for (const r of rows) byTeam[r.teamId] = (byTeam[r.teamId] || 0) + r.costUsd;
    return { totalCost, waste, avgQ, byTeam };
  }, [rows]);

  function send() {
    const result = runProxy({ teamId, model, prompt });
    setRows((prev) => [
      { ...result, id: Date.now(), ts: new Date().toISOString() },
      ...prev,
    ].slice(0, 40));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Requests", rows.length],
          ["Spend", `$${stats.totalCost.toFixed(5)}`],
          ["Avg quality", stats.avgQ.toFixed(2)],
          ["Waste flags", stats.waste],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl border border-black/5 bg-[#fbfbf8] p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">{k}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form
          className="space-y-3 rounded-2xl border border-black/5 bg-[#fbfbf8] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <p className="text-sm font-semibold">Proxy playground</p>
          <label className="block text-xs text-ink-muted">
            Team
            <select
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {["platform", "growth", "research", "support"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-ink-muted">
            Model
            <select
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {Object.keys({
                "gpt-4o": 1,
                "gpt-4o-mini": 1,
                "gpt-3.5-turbo": 1,
                "claude-3-5-sonnet": 1,
                "claude-3-5-haiku": 1,
              }).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-ink-muted">
            Prompt
            <textarea
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[#00d26a] px-4 py-2 text-sm font-bold text-[#052e1a]"
          >
            Send through proxy
          </button>
          <p className="text-[11px] text-ink-muted">
            Client-side mock of the TokenLens loop. Full proxy server:{" "}
            <code>projects/token-lens</code> on :4600.
          </p>
        </form>

        <div className="rounded-2xl border border-black/5 bg-[#0b1220] p-4 text-[#d1fae5]">
          <p className="font-mono text-[11px] text-white/50">latest recommendation</p>
          {rows[0] && (
            <div className="mt-3 space-y-2 font-mono text-xs">
              <p>
                {rows[0].teamId} · {rows[0].model} · {rows[0].complexity.level}
              </p>
              <p>
                quality {rows[0].quality.qualityScore} · hall{" "}
                {rows[0].quality.hallucinationRisk} · ${rows[0].costUsd}
              </p>
              <p className="text-[#00d26a]">
                {rows[0].recommendation.action}
                {"to" in rows[0].recommendation && rows[0].recommendation.to
                  ? ` → ${rows[0].recommendation.to}`
                  : ""}
              </p>
              <p className="text-white/70">{rows[0].recommendation.reason}</p>
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-white/80">
                {rows[0].output}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fbfbf8] text-[11px] uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Model</th>
              <th className="px-3 py-2">Complexity</th>
              <th className="px-3 py-2">Quality</th>
              <th className="px-3 py-2">Route</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((r) => (
              <tr key={r.id} className="border-t border-black/5">
                <td className="px-3 py-2">{r.teamId}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.model}</td>
                <td className="px-3 py-2">{r.complexity.level}</td>
                <td className="px-3 py-2">{r.quality.qualityScore.toFixed(2)}</td>
                <td className="px-3 py-2">
                  {r.recommendation.action}
                  {"to" in r.recommendation && r.recommendation.to
                    ? ` → ${r.recommendation.to}`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
