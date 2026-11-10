const root = document.getElementById("app");

function sparkline(values) {
  const w = 520;
  const h = 120;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1e-6);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 16) + 8;
      const y = h - 10 - ((v - min) / span) * (h - 20);
      return `${x},${y}`;
    })
    .join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline fill="none" stroke="#2f6f62" stroke-width="2.5" points="${pts}" /></svg>`;
}

async function main() {
  const meta = await fetch("/api/meta").then((r) => r.json());
  let exampleId = 0;
  let channel = 0;

  async function render() {
    const ex = await fetch(`/api/example/${exampleId}`).then((r) => r.json());
    const pred = await fetch("/api/predict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ window: ex.window }),
    }).then((r) => r.json());

    const series = ex.window.map((row) => row[channel]);
    const bars = meta.classes
      .map((c) => {
        const p = pred.probabilities[c] ?? 0;
        const warn = c !== "healthy";
        return `<div class="bar-row"><span>${c}</span><div class="bar ${warn ? "warn" : ""}"><i style="width:${(p * 100).toFixed(1)}%"></i></div><span>${(p * 100).toFixed(0)}%</span></div>`;
      })
      .join("");

    root.innerHTML = `
      <div class="metrics">
        <span>acc ${(meta.metrics.accuracy * 100).toFixed(1)}%</span>
        <span>macro F1 ${(meta.metrics.macro_f1 * 100).toFixed(1)}%</span>
        <span>train ${meta.metrics.n_train}</span>
        <span>test ${meta.metrics.n_test}</span>
      </div>
      <div class="grid">
        <section class="card">
          <p class="muted">Example window</p>
          <div class="row">
            <select id="ex">
              ${meta.examples.map((e) => `<option value="${e.id}" ${e.id === exampleId ? "selected" : ""}>${e.id + 1}. true ${e.label}</option>`).join("")}
            </select>
            <select id="ch">
              ${meta.channels.map((c, i) => `<option value="${i}" ${i === channel ? "selected" : ""}>${c}</option>`).join("")}
            </select>
            <button class="primary" id="run">Predict</button>
          </div>
          ${sparkline(series)}
          <p class="muted">True label: <strong>${ex.label}</strong></p>
        </section>
        <section class="card">
          <p class="muted">Model output</p>
          <p class="label">${pred.label}</p>
          <p class="muted">confidence ${(pred.confidence * 100).toFixed(1)}%</p>
          <div class="bars" style="margin-top:1rem">${bars}</div>
          <p class="muted" style="margin-top:1rem">Top channel energy</p>
          <ul>
            ${pred.topChannels.map((c) => `<li>${c.channel} · ${c.energy.toFixed(2)}</li>`).join("")}
          </ul>
        </section>
      </div>
    `;

    document.getElementById("ex").onchange = (e) => {
      exampleId = Number(e.target.value);
      render();
    };
    document.getElementById("ch").onchange = (e) => {
      channel = Number(e.target.value);
      render();
    };
    document.getElementById("run").onclick = () => render();
  }

  await render();
}

main().catch((err) => {
  root.textContent = String(err);
});
