const form = document.getElementById("job-form");
const reportEl = document.getElementById("report");
const eventsEl = document.getElementById("events");
const metricsEl = document.getElementById("metrics");

async function refreshMetrics() {
  const res = await fetch("/api/metrics");
  const m = await res.json();
  metricsEl.innerHTML = `<strong>Observability</strong> · enqueued ${m.enqueued} · completed ${m.completed} · failed ${m.failed} · avg ${m.avgMs}ms`;
}

async function loadPresets() {
  const { presets } = await (await fetch("/api/presets")).json();
  const bar = document.createElement("div");
  bar.style.display = "flex";
  bar.style.flexWrap = "wrap";
  bar.style.gap = "0.5rem";
  bar.style.marginBottom = "1rem";
  for (const p of presets) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = p.label;
    btn.style.fontSize = "0.75rem";
    btn.addEventListener("click", () => {
      form.url.value = p.url;
      form.claim.value = p.claim;
    });
    bar.appendChild(btn);
  }
  form.parentElement.insertBefore(bar, form);
}
loadPresets();


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  reportEl.innerHTML = "<p class='card'>Queued… polling workers</p>";
  eventsEl.innerHTML = "";

  const create = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: fd.get("url"), claim: fd.get("claim") }),
  });
  const { id } = await create.json();

  const poll = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    const job = await res.json();
    eventsEl.innerHTML = `<div class="card"><h2>Event log</h2>${job.events
      .map((ev) => `<div class="event">${ev.at} · ${ev.type}</div>`)
      .join("")}</div>`;

    if (job.status === "completed" && job.report) {
      reportEl.innerHTML = `
        <div class="card">
          <h2>Trust report</h2>
          <p class="band-${job.report.band}">Score ${job.report.score} · ${job.report.band}</p>
          <ul class="factors">${job.report.factors.map((f) => `<li>${f}</li>`).join("")}</ul>
          <p class="factors">${job.report.disclaimer}</p>
        </div>`;
      refreshMetrics();
      return;
    }
    if (job.status === "failed") {
      reportEl.innerHTML = `<div class="card">Failed: ${job.error}</div>`;
      return;
    }
    setTimeout(poll, 200);
  };
  poll();
});

refreshMetrics();
