const $ = (id) => document.getElementById(id);

async function jget(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

function money(n) {
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${Number(n || 0).toFixed(5)}`;
}

function renderMetrics(overview) {
  const items = [
    ["Requests", overview.requestCount],
    ["Total spend", money(overview.totalCostUsd)],
    ["Tokens", overview.totalTokens.toLocaleString()],
    ["Avg quality", overview.avgQuality.toFixed(2)],
    ["Hall. risk", overview.avgHallucinationRisk.toFixed(2)],
    ["Waste flags", overview.wasteCount],
  ];
  $("overview").innerHTML = items
    .map(
      ([label, value]) => `
      <div class="metric">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>`
    )
    .join("");
}

function renderBars(el, rows, keyLabel, keyValue, alt = false) {
  const max = Math.max(...rows.map((r) => r[keyValue]), 0.000001);
  el.innerHTML = rows
    .slice(0, 6)
    .map((r) => {
      const pct = Math.max(4, (r[keyValue] / max) * 100);
      return `
      <div class="bar-row">
        <span>${r[keyLabel]}</span>
        <div class="bar-track"><div class="bar-fill ${alt ? "alt" : ""}" style="width:${pct}%"></div></div>
        <span class="muted">${typeof r[keyValue] === "number" && keyValue.includes("cost") ? money(r[keyValue]) : r[keyValue]}</span>
      </div>`;
    })
    .join("") || `<p class="muted">No data yet — seed or use the playground.</p>`;
}

function renderComplexity(byComplexity) {
  const order = ["trivial", "simple", "moderate", "complex", "reasoning"];
  const rows = order
    .filter((k) => byComplexity[k])
    .map((k) => ({ level: k, count: byComplexity[k] }));
  renderBars($("complexity-bars"), rows, "level", "count", true);
}

function drawQuality(requests) {
  const canvas = $("quality-chart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 640;
  const cssH = 180;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const series = [...requests].reverse().slice(-24);
  if (!series.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "13px Outfit, sans-serif";
    ctx.fillText("Quality timeline appears after traffic", 16, cssH / 2);
    return;
  }

  const pad = { l: 28, r: 10, t: 12, b: 20 };
  const w = cssW - pad.l - pad.r;
  const h = cssH - pad.t - pad.b;

  ctx.strokeStyle = "#e5e7eb";
  for (let i = 0; i < 4; i++) {
    const y = pad.t + (h * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + w, y);
    ctx.stroke();
  }

  const plot = (getter, color) => {
    ctx.beginPath();
    series.forEach((r, i) => {
      const x = pad.l + (i / Math.max(1, series.length - 1)) * w;
      const y = pad.t + h - getter(r) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  plot((r) => r.quality?.qualityScore ?? 0, "#00d26a");
  plot((r) => r.quality?.hallucinationRisk ?? 0, "#ff3b30");

  ctx.fillStyle = "#6b7280";
  ctx.font = "11px IBM Plex Mono, monospace";
  ctx.fillText("quality", pad.l, 10);
  ctx.fillStyle = "#ff3b30";
  ctx.fillText("hall-risk", pad.l + 60, 10);
}

function renderRouting(rec) {
  $("routing-summary").innerHTML = `
    <span class="chip">Keep <strong>${rec.keep}</strong></span>
    <span class="chip">Downgrade <strong>${rec.downgrade}</strong></span>
    <span class="chip">Potential savings <strong>${money(rec.potentialSavingsUsd)}</strong></span>
  `;
  $("routing-table").innerHTML =
    rec.routes
      .map(
        (r) => `
      <div class="route-card">
        <div>
          <div class="pair">${r.from} → ${r.to}</div>
          <div class="muted">${r.count} requests with quality headroom</div>
        </div>
        <div><strong>${money(r.savingsUsd)}</strong></div>
      </div>`
      )
      .join("") || `<p class="muted">No downgrade opportunities in current window.</p>`;
}

function renderRequests(requests) {
  $("request-rows").innerHTML = requests
    .map((r) => {
      const route = r.recommendation?.action || "—";
      return `
      <tr>
        <td>${new Date(r.ts).toLocaleTimeString()}</td>
        <td>${r.teamId}</td>
        <td><code>${r.model}</code></td>
        <td>${r.complexity?.level ?? "—"}</td>
        <td><span class="badge ${r.quality?.band || ""}">${(r.quality?.qualityScore ?? 0).toFixed(2)}</span></td>
        <td>${(r.quality?.hallucinationRisk ?? 0).toFixed(2)}</td>
        <td>${money(r.costUsd)}</td>
        <td><span class="badge ${route}">${route}${
        route === "downgrade" ? ` → ${r.recommendation.to}` : ""
      }</span></td>
      </tr>`;
    })
    .join("");
}

async function refresh() {
  const [health, overview, requestsWrap, rec] = await Promise.all([
    jget("/api/health"),
    jget("/api/overview"),
    jget("/api/requests?limit=40"),
    jget("/api/recommendations"),
  ]);
  $("mode-pill").textContent = health.mode;
  renderMetrics(overview);
  renderBars($("team-bars"), overview.byTeam, "teamId", "costUsd");
  renderComplexity(overview.byComplexity || {});
  renderRouting(rec);
  renderRequests(requestsWrap.requests || []);
  drawQuality(requestsWrap.requests || []);
}

$("refresh-btn").addEventListener("click", () => refresh().catch(console.error));

$("play-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  $("play-out").textContent = "proxying…";
  const res = await fetch("/api/playground", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teamId: fd.get("teamId"),
      model: fd.get("model"),
      prompt: fd.get("prompt"),
    }),
  });
  const data = await res.json();
  $("play-out").textContent = JSON.stringify(
    {
      output: data.response?.choices?.[0]?.message?.content,
      tokenlens: data.response?.tokenlens,
      record: {
        complexity: data.record?.complexity,
        quality: data.record?.quality,
        recommendation: data.record?.recommendation,
        costUsd: data.record?.costUsd,
      },
    },
    null,
    2
  );
  await refresh();
});

window.addEventListener("resize", () => {
  jget("/api/requests?limit=40").then((d) => drawQuality(d.requests || []));
});

refresh().catch((err) => {
  $("play-out").textContent = String(err);
});
