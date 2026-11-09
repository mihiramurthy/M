"use client";

import { useMemo, useState } from "react";
import { compareScenarios } from "@/lib/demos/loanLattice";

export function LoanLatticeDemo() {
  const [principal, setPrincipal] = useState(40000);
  const [annualRate, setAnnualRate] = useState(0.055);
  const [agi, setAgi] = useState(48000);
  const [familySize, setFamilySize] = useState(1);
  const [pauseMonths, setPauseMonths] = useState(12);

  const result = useMemo(
    () => compareScenarios({ principal, annualRate, agi, familySize, pauseMonths }),
    [principal, annualRate, agi, familySize, pauseMonths]
  );

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl bg-paper-soft p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => e.preventDefault()}
      >
        {(
          [
            ["Principal", principal, setPrincipal, 1000],
            ["Rate", annualRate, setAnnualRate, 0.001],
            ["AGI", agi, setAgi, 1000],
            ["Family", familySize, setFamilySize, 1],
            ["Forbearance mo", pauseMonths, setPauseMonths, 1],
          ] as const
        ).map(([label, value, set, step]) => (
          <label key={label} className="text-xs text-ink-muted">
            {label}
            <input
              type="number"
              step={step}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink"
              value={value}
              onChange={(e) => set(Number(e.target.value))}
            />
          </label>
        ))}
      </form>
      <p className="text-sm text-ink-soft">
        Lowest cash outlay:{" "}
        <span className="font-semibold text-emerald-700">{result.insight.lowestCashOutlay}</span> ·
        Forbearance penalty vs standard:{" "}
        <span className="font-semibold text-accent">
          ${result.insight.forbearancePenaltyVsStandard.toLocaleString()}
        </span>
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {result.scenarios.map((s) => {
          const forgiven = "forgiven" in s ? Number(s.forgiven) : 0;
          const warning = "warning" in s ? String(s.warning ?? "") : "";
          const note = "note" in s ? String(s.note ?? "") : "";
          return (
            <article key={s.id} className="rounded-2xl border border-black/5 bg-paper-soft p-4">
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {s.months} months · ${s.monthlyPayment.toLocaleString()}/mo
              </p>
              <p className="mt-3">
                Total paid: <strong>${s.totalPaid.toLocaleString()}</strong>
              </p>
              <p className="text-xs text-ink-muted">
                Interest ${s.totalInterest.toLocaleString()}
                {forgiven > 0 ? ` · forgiven $${forgiven.toLocaleString()}` : ""}
              </p>
              {warning ? <p className="mt-2 text-xs text-accent">{warning}</p> : null}
              {note ? <p className="mt-2 text-xs text-ink-muted">{note}</p> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
