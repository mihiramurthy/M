/** JS mirror of the C controlled scheduler for the Vercel portfolio demo.
 * Authoritative engine: projects/concurrency-finder/c/dcf
 */

export type Mode = "random" | "explore" | "replay";

export type RunResult = {
  ok: boolean;
  engine: "js-mirror";
  example: string;
  seed: number;
  bug: string | null;
  message: string;
  schedule: number[];
  scheduleStr: string;
  minimal?: number[];
  minimalLen?: number;
  balance?: number;
  counter?: number;
};

/** Match C dcf_rng_next (xorshift64*). State held as BigInt. */
function xorshift64(state: { s: bigint }) {
  let x = state.s;
  if (x === 0n) x = 0x9e3779b97f4a7c15n;
  x ^= x >> 12n;
  x ^= x << 25n;
  x ^= x >> 27n;
  state.s = x;
  return (x * 0x2545f4914f6cdd1dn) & 0xffffffffffffffffn;
}

function pick(
  ready: number[],
  mode: Mode,
  rng: { s: bigint },
  exploreOff: { n: number },
  replay: number[],
  pos: { i: number }
) {
  if (mode === "replay") {
    while (pos.i < replay.length) {
      const want = replay[pos.i++];
      if (ready.includes(want)) return want;
    }
    return ready[0];
  }
  if (mode === "explore") return ready[exploreOff.n++ % ready.length];
  const n = BigInt(ready.length);
  return ready[Number(xorshift64(rng) % n)];
}

function namesFor(example: string) {
  return example === "lost_update" ? ["T0", "T1"] : ["A", "B"];
}

function formatSched(ids: number[], example: string) {
  const names = namesFor(example);
  return ids.map((i) => names[i] || "?").join(" → ");
}

/** bank_race: balance=100, withdraw 75 if >= 75 (check then act). */
function runBank(
  seed: number,
  mode: Mode,
  replay: number[] = [],
  maxSteps = 32,
  doShrink = true
): RunResult {
  const rng = { s: BigInt(seed || 1) };
  const exploreOff = { n: 0 };
  const pos = { i: 0 };
  let balance = 100;
  const can = [false, false];
  const pc = [0, 0];
  const done = [false, false];
  const schedule: number[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const ready = [0, 1].filter((i) => !done[i]);
    if (!ready.length) break;
    const t = pick(ready, mode, rng, exploreOff, replay, pos);
    schedule.push(t);
    if (pc[t] === 0) {
      can[t] = balance >= 75;
      pc[t] = 1;
    } else if (pc[t] === 1) {
      if (can[t]) balance -= 75;
      done[t] = true;
      if (balance < 0) {
        const base: RunResult = {
          ok: false,
          engine: "js-mirror",
          example: "bank_race",
          seed,
          bug: "bank_race",
          message: `balance=${balance} after racy withdraws (expected >= 0; safe end-state is 25)`,
          schedule,
          scheduleStr: formatSched(schedule, "bank_race"),
          balance,
        };
        if (doShrink) {
          const minimal = shrinkBank(seed, schedule);
          base.minimal = minimal;
          base.minimalLen = minimal.length;
        }
        return base;
      }
    }
  }
  return {
    ok: true,
    engine: "js-mirror",
    example: "bank_race",
    seed,
    bug: null,
    message: `no bug (balance=${balance})`,
    schedule,
    scheduleStr: formatSched(schedule, "bank_race"),
    balance,
  };
}

function shrinkBank(seed: number, schedule: number[]) {
  let cur = [...schedule];
  let progress = true;
  while (progress && cur.length > 1) {
    progress = false;
    for (let i = 0; i < cur.length; i++) {
      const cand = cur.filter((_, j) => j !== i);
      const r = runBank(seed, "replay", cand, 32, false);
      if (!r.ok && cand.length < cur.length) {
        cur = cand;
        progress = true;
        break;
      }
    }
  }
  /* concrete schedule under minimal choice prefix */
  return runBank(seed, "replay", cur, 32, false).schedule;
}

function runLost(
  seed: number,
  mode: Mode,
  replay: number[] = [],
  maxSteps = 32,
  doShrink = true
): RunResult {
  const rng = { s: BigInt(seed || 1) };
  const exploreOff = { n: 0 };
  const pos = { i: 0 };
  let counter = 0;
  const tmp = [0, 0];
  const pc = [0, 0];
  const done = [false, false];
  let stores = 0;
  const schedule: number[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const ready = [0, 1].filter((i) => !done[i]);
    if (!ready.length) break;
    const t = pick(ready, mode, rng, exploreOff, replay, pos);
    schedule.push(t);
    if (pc[t] === 0) {
      tmp[t] = counter;
      pc[t] = 1;
    } else if (pc[t] === 1) {
      tmp[t] += 1;
      pc[t] = 2;
    } else {
      counter = tmp[t];
      stores++;
      done[t] = true;
      if (stores === 2 && counter !== 2) {
        const base: RunResult = {
          ok: false,
          engine: "js-mirror",
          example: "lost_update",
          seed,
          bug: "lost_update",
          message: `lost update: counter=${counter} (expected 2)`,
          schedule,
          scheduleStr: formatSched(schedule, "lost_update"),
          counter,
        };
        if (doShrink) {
          const minimal = shrinkLost(seed, schedule);
          base.minimal = minimal;
          base.minimalLen = minimal.length;
        }
        return base;
      }
    }
  }
  return {
    ok: true,
    engine: "js-mirror",
    example: "lost_update",
    seed,
    bug: null,
    message: `no bug (counter=${counter})`,
    schedule,
    scheduleStr: formatSched(schedule, "lost_update"),
    counter,
  };
}

function shrinkLost(seed: number, schedule: number[]) {
  let cur = [...schedule];
  let progress = true;
  while (progress && cur.length > 1) {
    progress = false;
    for (let i = 0; i < cur.length; i++) {
      const cand = cur.filter((_, j) => j !== i);
      const r = runLost(seed, "replay", cand, 32, false);
      if (!r.ok && cand.length < cur.length) {
        cur = cand;
        progress = true;
        break;
      }
    }
  }
  return runLost(seed, "replay", cur, 32, false).schedule;
}

export function runExample(
  example: string,
  seed: number,
  mode: Mode = "random",
  replay: number[] = []
) {
  return example === "lost_update"
    ? runLost(seed, mode, replay)
    : runBank(seed, mode, replay);
}

export type BenchStats = {
  mode: string;
  trials: number;
  bugsFound: number;
  firstBugTrial: number;
  rawScheduleLen: number;
  shrunkScheduleLen: number;
};

export function bench(example: string, trials = 100, baseSeed = 1) {
  const random: BenchStats = {
    mode: "random_stress",
    trials,
    bugsFound: 0,
    firstBugTrial: 0,
    rawScheduleLen: 0,
    shrunkScheduleLen: 0,
  };
  const explore: BenchStats = {
    mode: "controlled_explore",
    trials,
    bugsFound: 0,
    firstBugTrial: 0,
    rawScheduleLen: 0,
    shrunkScheduleLen: 0,
  };

  for (let i = 0; i < trials; i++) {
    const seed = Number(BigInt(baseSeed) + BigInt(i) * 2654435761n);
    const r = runExample(example, seed || 1, "random");
    if (!r.ok) {
      random.bugsFound++;
      if (!random.firstBugTrial) {
        random.firstBugTrial = i + 1;
        random.rawScheduleLen = r.schedule.length;
        random.shrunkScheduleLen = r.minimalLen || r.schedule.length;
      }
    }
  }
  for (let i = 0; i < trials; i++) {
    const r = runExample(example, baseSeed + i, "explore");
    if (!r.ok) {
      explore.bugsFound++;
      if (!explore.firstBugTrial) {
        explore.firstBugTrial = i + 1;
        explore.rawScheduleLen = r.schedule.length;
        explore.shrunkScheduleLen = r.minimalLen || r.schedule.length;
      }
    }
  }

  return {
    example,
    trials,
    random,
    explore,
    summary: `controlled explore found bug on trial ${explore.firstBugTrial} vs random trial ${random.firstBugTrial}; shrink ${explore.rawScheduleLen || random.rawScheduleLen}→${explore.shrunkScheduleLen || random.shrunkScheduleLen} steps`,
  };
}
