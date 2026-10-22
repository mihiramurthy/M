const form = document.getElementById("match-form");
const results = document.getElementById("results");
const prep = document.getElementById("prep");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const profile = {
    lat: 38.9897,
    lon: -76.9378,
    zip: "20740",
    specialty: fd.get("specialty"),
    languages: [fd.get("language")],
    uninsured: fd.get("uninsured") === "on",
    medicaid: fd.get("medicaid") === "on",
    incomeBand: fd.get("uninsured") === "on" ? "low" : "mid",
    maxMiles: Number(fd.get("maxMiles")),
  };

  results.innerHTML = "<p>Matching…</p>";
  const res = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  const data = await res.json();

  results.innerHTML = data.matches
    .map(
      (m, i) => `
      <article class="card">
        <h2>${i + 1}. ${m.clinic.name}
          <span class="score">score ${m.score.toFixed(1)}</span>
        </h2>
        <p class="meta">${m.distance.toFixed(1)} mi · ${m.clinic.specialty} ·
          ~$${m.clinic.cashVisitEstimate} cash · ${m.clinic.phone}</p>
        <ul class="reasons">${m.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>
        <button data-clinic="${m.clinic.id}" type="button">Build visit prep</button>
      </article>`
    )
    .join("");

  results.querySelectorAll("button[data-clinic]").forEach((btn) => {
    btn.addEventListener("click", () => loadPrep(btn.dataset.clinic, profile));
  });
});

async function loadPrep(clinicId, profile) {
  const res = await fetch("/api/prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clinicId, profile }),
  });
  const data = await res.json();
  prep.innerHTML = `
    <article class="card">
      <h2>Visit prep — ${data.clinicName}</h2>
      <p class="meta">Estimated cash visit: $${data.estimatedCashVisit ?? "—"}</p>
      <ul class="prep-list">
        ${data.items
          .map(
            (item) =>
              `<li>${item.label}${item.required ? '<span class="req">required</span>' : ""}</li>`
          )
          .join("")}
      </ul>
    </article>`;
}
