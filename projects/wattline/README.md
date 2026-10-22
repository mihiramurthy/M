# Wattline

**Grid carbon intensity explorer + demand-response planner for households.**

Most people still run dishwashers and EV chargers whenever it’s convenient — not when the regional grid is cleanest. Wattline simulates a 48-hour regional intensity curve (renewables mix, demand shape, marginal fuel), lets you place flexible loads, and shows kilograms of CO₂e avoided versus a naive schedule.

## Why this exists

- Electrification without timing literacy can *increase* emissions
- Utility “green hours” UIs are opaque; Wattline exposes the simulation knobs
- Pure frontend-substance demo: real scheduling math, polished interactive viz

## Run

```bash
cd projects/wattline
npm install
npm run dev
# http://localhost:4400
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/forecast?region=midatlantic` | 48h intensity + demand forecast |
| POST | `/api/plan` | Optimize flexible loads against intensity |
