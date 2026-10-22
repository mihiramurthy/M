const form = document.getElementById("job-form");
const reportEl = document.getElementById("report");
const eventsEl = document.getElementById("events");
const metricsEl = document.getElementById("metrics");

async function refreshMetrics() {
  const res = await fetch("/api/metrics");
  const m = await res.json();
  metricsEl.innerHTML = `<strong>Observability</strong> · enqueued ${m.enqueued} · completed ${m.completed} · failed ${m.failed} · avg ${m.avgMs}ms`;
}

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
