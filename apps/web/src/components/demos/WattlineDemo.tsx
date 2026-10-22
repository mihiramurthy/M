"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildForecast,
  planLoads,
  regionOptions,
  type RegionId,
} from "@/lib/demos/wattline";

export function WattlineDemo() {
  const [region, setRegion] = useState<RegionId>("midatlantic");
  const [planned, setPlanned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const forecast = useMemo(() => buildForecast(region, 48), [region]);
  const plan = useMemo(
    () => (planned ? planLoads(forecast) : null),
    [planned, forecast]
  );
  const placements = plan?.placements ?? [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 640;
    const cssH = 240;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const series = forecast.series;
    const pad = { l: 36, r: 12, t: 16, b: 24 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;
    const min = Math.min(...series.map((p) => p.gCo2PerKwh));
    const max = Math.max(...series.map((p) => p.gCo2PerKwh));

    ctx.strokeStyle = "#2a3222";
    for (let i = 0; i < 4; i++) {
      const y = pad.t + (h * i) / 3;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + w, y);
      ctx.stroke();
    }

    for (const p of placements) {
      const x0 = pad.l + (p.startHourOffset / (series.length - 1)) * w;
      const x1 = pad.l + (p.endHourOffset / (series.length - 1)) * w;
      ctx.fillStyle = "rgba(63,175,127,0.15)";
      ctx.fillRect(x0, pad.t, Math.max(2, x1 - x0), h);
    }

    ctx.beginPath();
    series.forEach((p, i) => {
      const x = pad.l + (i / (series.length - 1)) * w;
      const y = pad.t + h - ((p.gCo2PerKwh - min) / (max - min || 1)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#3faf7f";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#7a9586";
    ctx.font = "11px sans-serif";
    ctx.fillText(String(max), 4, pad.t + 8);
    ctx.fillText(String(min), 4, pad.t + h);
  }, [forecast, placements]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-mist-400">
          Region
          <select
            className="mt-1 block rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-mist-50"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value as RegionId);
              setPlanned(false);
            }}
          >
            {regionOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-ink-950"
          onClick={() => setPlanned(true)}
        >
          Optimize flexible loads
        </button>
      </div>
      <div className="rounded-xl border border-white/10 bg-ink-800/40 p-3">
        <canvas ref={canvasRef} className="h-60 w-full" />
        <p className="mt-2 text-sm text-mist-400">
          {forecast.regionName} · 48h avg {forecast.average} gCO₂e/kWh
        </p>
      </div>
      {plan && (
        <div className="rounded-xl border border-white/10 bg-ink-800/50 p-4">
          <p className="text-signal">
            {plan.totals.savedKg} kg CO₂e saved across {plan.totals.kwh} kWh
          </p>
          <ul className="mt-3 space-y-2 text-sm text-mist-300">
            {plan.placements.map((p) => (
              <li key={p.id}>
                <strong className="text-mist-50">{p.name}</strong> · starts H+
                {p.startHourOffset} · saves {(p.gramsSaved / 1000).toFixed(2)} kg
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
