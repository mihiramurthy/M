# CareAtlas

**Access-to-care navigator for underinsured patients.**

Finding a clinic that takes sliding-scale payments, speaks your language, and treats the right specialty still means calling ten numbers and hoping. CareAtlas matches people to real-shaped clinic inventory using eligibility heuristics, distance, language, and cost transparency — then generates a visit-prep checklist so the appointment is not wasted.

## Why this exists

- 1 in 4 US adults delay care due to cost
- Directory apps list providers; few model **affordability + language + specialty** together
- Patients often arrive without documents clinics need for charity-care intake

## Stack

- Node.js + Express API
- SQLite (`better-sqlite3`) clinic + patient-session store
- Deterministic matching engine with explainable scores
- Static demo UI served from `public/`

## Run

```bash
cd projects/care-atlas
npm install
npm run seed
npm run dev
# open http://localhost:4100
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness |
| GET | `/api/clinics` | List seeded clinics |
| POST | `/api/match` | Rank clinics for a patient profile |
| POST | `/api/prep` | Generate visit-prep checklist |

## Demo profile

`POST /api/match` with:

```json
{
  "zip": "20740",
  "lat": 38.9897,
  "lon": -76.9378,
  "uninsured": true,
  "incomeBand": "low",
  "languages": ["es", "en"],
  "specialty": "primary",
  "maxMiles": 25
}
```
