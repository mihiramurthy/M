const VALID = `goal: Q
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: Q  [MP P1 P2]`;

const INVALID = `goal: P
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: P  [MP P1 P2]`;

const proofEl = document.getElementById("proof");
const resultEl = document.getElementById("result");
proofEl.value = INVALID;

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("panel-student").classList.toggle("hidden", tab !== "student");
    document.getElementById("panel-ta").classList.toggle("hidden", tab !== "ta");
    if (tab === "ta") refreshTa();
  });
});

document.getElementById("load-valid").onclick = () => {
  proofEl.value = VALID;
};
document.getElementById("load-invalid").onclick = () => {
  proofEl.value = INVALID;
};

function renderResult(data) {
  if (data.ok) {
    resultEl.className = "result valid";
    resultEl.innerHTML = `
      <h2>✓ Proof accepted</h2>
      <p class="mono">engine=${data.engine} · steps=${data.stepsChecked} · goalReached=${data.goalReached}</p>
      <ol class="mono">${(data.steps || [])
        .map((s) => `<li><strong>${s.id}</strong>: ${s.formula} <em>[${s.rule}]</em></li>`)
        .join("")}</ol>`;
    return;
  }
  const e = data.error || {};
  resultEl.className = "result invalid";
  resultEl.innerHTML = `
    <h2>✗ First invalid inference at ${e.stepId || "?"}</h2>
    <p><strong>${e.formula || ""}</strong> via <code>${e.rule || ""}</code></p>
    <p>${e.message || data.error || "Unknown error"}</p>
    <p class="muted">${e.hint || ""}</p>
    <p class="mono">pattern=${data.pattern || "?"} · steps before error=${data.stepsBeforeError ?? "?"}</p>`;
}

async function check() {
  resultEl.className = "result empty";
  resultEl.textContent = "Checking with OCaml kernel…";
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proof: proofEl.value }),
  });
  const data = await res.json();
  renderResult(data);
  return data;
}

document.getElementById("check-btn").onclick = () => check().catch((e) => {
  resultEl.className = "result invalid";
  resultEl.textContent = String(e);
});

document.getElementById("sketch-btn").onclick = async () => {
  const text = document.getElementById("informal").value;
  const res = await fetch("/api/informal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (data.formal) proofEl.value = data.formal;
  resultEl.className = "result empty";
  resultEl.innerHTML = `<p class="muted">${(data.notes || []).join(" ")} (provider: ${data.provider})</p>`;
};

document.getElementById("submit-form").onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      proof: proofEl.value,
      studentId: fd.get("studentId"),
      exercise: fd.get("exercise"),
    }),
  });
  const data = await res.json();
  renderResult(data.result);
};

async function refreshTa() {
  const [clusters, recent] = await Promise.all([
    fetch("/api/ta/clusters").then((r) => r.json()),
    fetch("/api/ta/recent").then((r) => r.json()),
  ]);
  document.getElementById("ta-summary").innerHTML = [
    ["Submissions", clusters.totalSubmissions],
    ["Valid", clusters.validCount],
    ["Invalid", clusters.invalidCount],
    ["Patterns", clusters.clusters.length],
  ]
    .map(
      ([label, value]) =>
        `<div class="metric"><div class="label">${label}</div><div class="value">${value}</div></div>`
    )
    .join("");

  document.getElementById("ta-clusters").innerHTML =
    clusters.clusters
      .map(
        (c) => `
      <article class="cluster">
        <div class="count">${c.count}× ${c.pattern}</div>
        <p class="muted">exercises: ${Object.entries(c.exercises)
          .map(([k, v]) => `${k} (${v})`)
          .join(", ")}</p>
        <ul class="mono">${c.examples
          .map((ex) => `<li>${ex.studentId} @ ${ex.stepId || "?"}: ${ex.message || ""}</li>`)
          .join("")}</ul>
      </article>`
      )
      .join("") || `<p class="muted">No invalid patterns yet — submit some broken proofs.</p>`;

  document.getElementById("ta-recent").innerHTML = (recent.submissions || [])
    .map(
      (s) => `
      <tr>
        <td>${new Date(s.ts).toLocaleString()}</td>
        <td>${s.studentId}</td>
        <td>${s.exercise}</td>
        <td>${s.ok ? "valid" : "invalid"}</td>
        <td class="mono">${s.pattern}</td>
      </tr>`
    )
    .join("");
}

fetch("/api/health")
  .then((r) => r.json())
  .then((h) => {
    const pill = document.getElementById("engine-pill");
    pill.textContent = h.ocamlEngine ? "ocaml ready" : "ocaml missing";
    pill.className = `pill ${h.ocamlEngine ? "ok" : "bad"}`;
  });
