# AquiferNet

**Groundwater contamination risk model with offline evaluation + interactive explorer.**

Private wells and rural aquifers rarely get the transparency of municipal drinking-water dashboards. AquiferNet trains a supervised risk classifier on synthetic-but-physically-plausible sensor features (nitrates, pH, turbidity, proximity to agriculture/industry, depth), ships evaluation metrics, and exposes an interactive county-style explorer for what-if inference.

## Why this exists

- Nitrate and industrial plume risk is unevenly monitored
- Communities need **interpretable** risk signals, not opaque vendor scores
- Recruiters can inspect training, metrics, and live inference end-to-end

## Stack

- Python + scikit-learn training (`ml/train.py`)
- Exported logistic model JSON (coefficients) for portable Node inference
- Express API + static explorer UI

## Run

```bash
cd projects/aquifer-net
npm install
pip install -r requirements.txt   # scikit-learn, numpy
npm run train                     # writes model/model.json + model/metrics.json
npm run dev                       # http://localhost:4300
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Liveness + model loaded |
| GET | `/api/metrics` | Offline evaluation report |
| GET | `/api/sites` | Seeded monitoring sites |
| POST | `/api/predict` | Risk probability for feature vector |
