const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");
const regionEl = document.getElementById("region");
const results = document.getElementById("results");
const avgEl = document.getElementById("avg");
let forecast = null;
let placements = [];

function draw() {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 960;
  const cssH = 280;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  if (!forecast) return;

  const series = forecast.series;
  const pad = { l: 36, r: 12, t: 16, b: 28 };
  const w = cssW - pad.l - pad.r;
  const h = cssH - pad.t - pad.b;
  const min = Math.min(...series.map((p) => p.gCo2PerKwh));
  const max = Math.max(...series.map((p) => p.gCo2PerKwh));

  // grid
  ctx.strokeStyle = "#2a3222";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = pad.t + (h * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + w, y);
    ctx.stroke();
  }

  // placement bands
  for (const p of placements) {
    const x0 = pad.l + (p.startHourOffset / (series.length - 1)) * w;
    const x1 = pad.l + (p.endHourOffset / (series.length - 1)) * w;
    ctx.fillStyle = "rgba(184,242,61,0.12)";
    ctx.fillRect(x0, pad.t, Math.max(2, x1 - x0), h);
  }

  // intensity line
  ctx.beginPath();
  series.forEach((p, i) => {
    const x = pad.l + (i / (series.length - 1)) * w;
    const y = pad.t + h - ((p.gCo2PerKwh - min) / (max - min || 1)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#b8f23d";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = "#9aa892";
  ctx.font = "12px sans-serif";
  ctx.fillText(`${max}`, 4, pad.t + 8);
  ctx.fillText(`${min}`, 4, pad.t + h);
  ctx.fillText("0h", pad.l, cssH - 8);
  ctx.fillText("48h", pad.l + w - 24, cssH - 8);
}

async function loadForecast() {
  forecast = await (await fetch(`/api/forecast?region=${regionEl.value}`)).json();
  placements = [];
  avgEl.textContent = `${forecast.regionName} · 48h average ${forecast.average} gCO₂e/kWh`;
  results.innerHTML = "";
  draw();
}

document.getElementById("plan-btn").addEventListener("click", async () => {
  const data = await (
    await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: regionEl.value }),
    })
  ).json();
  forecast = data.forecast;
  placements = data.plan.placements;
  avgEl.textContent = `${forecast.regionName} · optimized vs evening-naive schedule`;
  results.innerHTML = `
    <p><span class="save">${data.plan.totals.savedKg} kg CO₂e saved</span>
      across ${data.plan.totals.kwh} kWh
      (optimized ${data.plan.totals.optimizedKg} kg vs naive ${data.plan.totals.naiveKg} kg)</p>
    ${placements
      .map(
        (p) => `
      <div class="placement">
        <strong>${p.name}</strong> · ${p.kwh} kWh · ${p.durationHours}h window starting H+${p.startHourOffset}
        · avg ${p.avgIntensity} vs naive ${p.naiveAvgIntensity} g/kWh
        · <span class="save">saves ${(p.gramsSaved / 1000).toFixed(2)} kg</span>
      </div>`
      )
      .join("")}`;
  draw();
});

regionEl.addEventListener("change", loadForecast);
window.addEventListener("resize", draw);
loadForecast();
