const form = document.getElementById("sim-form");
const scenariosEl = document.getElementById("scenarios");
const insightEl = document.getElementById("insight");

async function simulate(e) {
  e?.preventDefault();
  const fd = new FormData(form);
  const body = {
    principal: Number(fd.get("principal")),
    annualRate: Number(fd.get("annualRate")),
    agi: Number(fd.get("agi")),
    familySize: Number(fd.get("familySize")),
    pauseMonths: Number(fd.get("pauseMonths")),
  };
  const data = await (
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  ).json();

  insightEl.innerHTML = `
    <strong>Insight</strong>
    <p class="meta">
      Lowest cash outlay: <span class="signal">${data.insight.lowestCashOutlay}</span> ·
      Forbearance penalty vs standard:
      <span class="warn">$${data.insight.forbearancePenaltyVsStandard.toLocaleString()}</span> ·
      IDR vs standard cash delta: $${data.insight.idrVsStandardCash.toLocaleString()}
    </p>`;

  scenariosEl.innerHTML = data.scenarios
    .map(
      (s) => `
      <article class="panel card">
        <h2>${s.name}</h2>
        <p class="meta">${s.months} months · $${s.monthlyPayment.toLocaleString()}/mo</p>
        <p>Total paid: <strong>$${s.totalPaid.toLocaleString()}</strong></p>
        <p class="meta">Interest $${s.totalInterest.toLocaleString()}
          ${s.forgiven ? ` · forgiven $${s.forgiven.toLocaleString()}` : ""}</p>
        ${s.warning ? `<p class="warn">${s.warning}</p>` : ""}
        ${s.note ? `<p class="meta">${s.note}</p>` : ""}
        ${
          s.interestCapitalized
            ? `<p class="warn">Capitalized interest: $${s.interestCapitalized.toLocaleString()} → balance $${s.balanceAfterCapitalization.toLocaleString()}</p>`
            : ""
        }
      </article>`
    )
    .join("");
}

form.addEventListener("submit", simulate);
simulate();
