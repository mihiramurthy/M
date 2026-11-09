const $ = (id) => document.getElementById(id);

async function boot() {
  try {
    const h = await fetch("/api/health").then((r) => r.json());
    $("engine-pill").textContent = h.ok ? "c-dcf ready" : "engine error";
  } catch {
    $("engine-pill").textContent = "engine down";
  }
}

function showResult(data) {
  const el = $("result");
  el.classList.remove("empty", "bad", "good");
  if (data.ok) {
    el.classList.add("good");
    el.innerHTML = `<h3>✓ No bug in this schedule</h3><p>${data.message}</p>
      <div class="meta">seed=${data.seed} · steps=${data.scheduleLen}</div>`;
  } else {
    el.classList.add("bad");
    el.innerHTML = `<h3>✗ Bug: ${data.bug || "race"}</h3>
      <p>${data.message}</p>
      <div class="meta">seed=${data.seed} · raw=${data.scheduleLen}
      ${data.minimalLen ? ` · shrunk=${data.minimalLen}` : ""}</div>`;
  }
  const sched = data.scheduleStr || (data.schedule || []).join(" → ");
  const mini = data.minimal
    ? `\nminimal: [${data.minimal.join(", ")}] (${data.minimalLen})`
    : "";
  $("schedule").textContent = `schedule: ${sched}\nids: [${(data.schedule || []).join(", ")}]${mini}`;
}

async function run(explore = false) {
  $("result").textContent = "Running C engine…";
  $("result").className = "result empty";
  $("bench").classList.add("hidden");
  const body = {
    example: $("example").value,
    seed: Number($("seed").value) || 1,
    shrink: true,
    explore,
  };
  const data = await fetch("/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
  if (data.error) throw new Error(data.error);
  showResult(data);
}

async function bench() {
  $("result").textContent = "Benchmarking random stress vs controlled explore…";
  $("result").className = "result empty";
  const body = {
    example: $("example").value,
    trials: 200,
    seed: 1,
  };
  const data = await fetch("/api/bench", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
  if (data.error) throw new Error(data.error);

  $("result").className = "result good";
  $("result").innerHTML = `<h3>Benchmark complete</h3><p>${data.summary}</p>`;
  $("schedule").textContent = JSON.stringify({ random: data.random, explore: data.explore }, null, 2);

  const b = $("bench");
  b.classList.remove("hidden");
  b.innerHTML = `
    <div class="metric"><strong>Random stress</strong>
      <span>${data.random.bugsFound}/${data.random.trials} bugs · first@${data.random.firstBugTrial} · ${data.random.elapsedMs.toFixed(2)}ms</span></div>
    <div class="metric"><strong>Controlled explore</strong>
      <span>${data.explore.bugsFound}/${data.explore.trials} bugs · first@${data.explore.firstBugTrial} · ${data.explore.elapsedMs.toFixed(2)}ms</span></div>
    <div class="metric"><strong>Shrink</strong>
      <span>${data.explore.rawScheduleLen || data.random.rawScheduleLen} → ${data.explore.shrunkScheduleLen || data.random.shrunkScheduleLen} steps</span></div>`;
}

$("run-btn").onclick = () => run(false).catch((e) => alert(e.message));
$("explore-btn").onclick = () => run(true).catch((e) => alert(e.message));
$("bench-btn").onclick = () => bench().catch((e) => alert(e.message));
boot();
