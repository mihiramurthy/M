const FEATURES = [
  ["nitrate_mg_l", 8, "Nitrate (mg/L)"],
  ["ph", 7.1, "pH"],
  ["turbidity_ntu", 3, "Turbidity (NTU)"],
  ["ag_proximity_km", 3, "Ag proximity (km)"],
  ["industry_proximity_km", 5, "Industry proximity (km)"],
  ["well_depth_m", 35, "Well depth (m)"],
  ["rainfall_30d_mm", 60, "30d rainfall (mm)"],
];

const form = document.getElementById("predict-form");
form.innerHTML =
  FEATURES.map(
    ([name, val, label]) =>
      `<label>${label}<input name="${name}" type="number" step="any" value="${val}" /></label>`
  ).join("") + `<button type="submit">Predict risk</button>`;

async function loadMetrics() {
  const m = await (await fetch("/api/metrics")).json();
  document.getElementById("metrics").innerHTML = `
    <strong>Offline eval</strong> · accuracy ${(m.accuracy * 100).toFixed(1)}% ·
    ROC-AUC ${m.roc_auc.toFixed(3)} · Brier ${m.brier.toFixed(3)} ·
    n=${m.n_train}/${m.n_test} train/test
    <p class="meta">${m.notes}</p>`;
}

async function loadSites() {
  const { sites } = await (await fetch("/api/sites")).json();
  document.getElementById("sites").innerHTML = sites
    .map(
      (s) => `
      <article class="site">
        <h3>${s.name}</h3>
        <p class="meta">${s.county} · ${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}</p>
        <p class="band-${s.prediction.band}">
          ${(s.prediction.probability * 100).toFixed(1)}% · ${s.prediction.band} risk
        </p>
        <button type="button" data-site='${JSON.stringify(s.features)}'>Load into predictor</button>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-site]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const feats = JSON.parse(btn.dataset.site);
      for (const [name] of FEATURES) {
        form.elements[name].value = feats[name];
      }
      form.requestSubmit();
    });
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(
    FEATURES.map(([name]) => [name, Number(new FormData(form).get(name))])
  );
  const pred = await (
    await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  ).json();
  document.getElementById("prediction").innerHTML = `
    <p class="band-${pred.band}" style="margin-top:1rem">
      ${(pred.probability * 100).toFixed(1)}% elevated-risk probability · ${pred.band}
    </p>
    <ul class="drivers">
      ${pred.topDrivers
        .map(
          (d) =>
            `<li>${d.feature}: value ${d.value.toFixed?.(2) ?? d.value} · contrib ${d.contribution.toFixed(2)}</li>`
        )
        .join("")}
    </ul>`;
});

loadMetrics();
loadSites();
