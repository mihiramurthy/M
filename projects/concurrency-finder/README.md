# Concurrency Finder

**Deterministic concurrency bug finder for C** — controlled scheduler, seed replay, schedule shrinking, and clear benchmarks against random stress testing.

## Why

Random stress testing flails at rare interleavings. A seed-driven scheduler makes failing schedules **reproducible**, then delta-debugs them to a **minimal** thread sequence — the kind of artifact you want in a trading-systems / OS interview loop.

## Architecture

```
example threads (explicit steps)
        ↓
 controlled scheduler (seed RNG | explore | replay)
        ↓
 bug? → record schedule → shrink → JSON
        ↓
 Node UI (:4800) + portfolio demo
```

### Examples
- `bank_race` — check-then-act withdraw (balance 100, withdraw 75 × 2 → can hit −50)
- `lost_update` — non-atomic `tmp=x; tmp++; x=tmp` (final counter can be 1)

## Build & run

```bash
cd projects/concurrency-finder
npm install
npm run build:c
npm test
npm run dev
# http://localhost:4800
```

```bash
# CLI
./c/dcf run --example bank_race --seed 16 --shrink
./c/dcf replay --example bank_race --seed 16 --schedule 0,1,0,1
./c/dcf bench --example bank_race --trials 200 --seed 1
```

## Typical bench numbers (bank_race, 100 trials)

| Mode | Bugs found | First bug trial |
|------|------------|-----------------|
| Random stress | ~57/100 | ~3 |
| Controlled explore | 100/100 | 1 |

Exact counts depend on seed; explore consistently finds the race earlier and more often.
