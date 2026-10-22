#!/usr/bin/env python3
"""Train a groundwater contamination risk classifier and export portable JSON."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    brier_score_loss,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "model"
FEATURES = [
    "nitrate_mg_l",
    "ph",
    "turbidity_ntu",
    "ag_proximity_km",
    "industry_proximity_km",
    "well_depth_m",
    "rainfall_30d_mm",
]


def synthesize(n: int = 2400, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    nitrate = rng.gamma(2.2, 3.5, n)
    ph = rng.normal(7.1, 0.55, n).clip(5.2, 9.0)
    turbidity = rng.lognormal(0.8, 0.7, n).clip(0.1, 80)
    ag = rng.exponential(4.5, n).clip(0.05, 40)
    industry = rng.exponential(6.0, n).clip(0.05, 50)
    depth = rng.normal(38, 14, n).clip(6, 120)
    rain = rng.gamma(3.0, 12.0, n)

    # Latent risk logit with physically motivated signs
    logit = (
        -2.4
        + 0.28 * nitrate
        + 0.35 * np.maximum(0, 6.5 - ph)
        + 0.08 * turbidity
        + 0.55 / (ag + 0.4)
        + 0.35 / (industry + 0.6)
        - 0.02 * depth
        + 0.01 * rain
        + rng.normal(0, 0.55, n)
    )
    prob = 1 / (1 + np.exp(-logit))
    y = (rng.random(n) < prob).astype(int)
    X = np.column_stack([nitrate, ph, turbidity, ag, industry, depth, rain])
    return X, y


def main() -> None:
    X, y = synthesize()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=7, stratify=y
    )

    pipe = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "clf",
                LogisticRegression(max_iter=1000, class_weight="balanced", random_state=7),
            ),
        ]
    )
    pipe.fit(X_train, y_train)

    proba = pipe.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)

    metrics = {
        "n_train": int(len(y_train)),
        "n_test": int(len(y_test)),
        "positive_rate_train": float(y_train.mean()),
        "positive_rate_test": float(y_test.mean()),
        "accuracy": float(accuracy_score(y_test, pred)),
        "roc_auc": float(roc_auc_score(y_test, proba)),
        "brier": float(brier_score_loss(y_test, proba)),
        "classification_report": classification_report(
            y_test, pred, target_names=["low_risk", "elevated_risk"], output_dict=True
        ),
        "threshold": 0.5,
        "notes": (
            "Synthetic but physically motivated features for demo reproducibility. "
            "Not a regulatory model."
        ),
    }

    scaler: StandardScaler = pipe.named_steps["scaler"]
    clf: LogisticRegression = pipe.named_steps["clf"]

    model = {
        "type": "logistic_regression_standard_scaled",
        "features": FEATURES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "coefficients": clf.coef_[0].tolist(),
        "intercept": float(clf.intercept_[0]),
        "threshold": 0.5,
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    (MODEL_DIR / "model.json").write_text(json.dumps(model, indent=2))
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))

    # Seeded monitoring sites for the explorer UI
    sites = []
    labels = [
        ("Paint Branch Aquifer", 39.01, -76.92, "Prince George's"),
        ("Anacostia Alluvial", 38.90, -76.94, "Prince George's"),
        ("Patuxent Valley", 38.85, -76.70, "Anne Arundel"),
        ("Monocacy Bench", 39.40, -77.40, "Frederick"),
        ("Eastern Shore Sand", 38.78, -76.07, "Talbot"),
        ("Industrial Corridor Wellfield", 39.25, -76.55, "Baltimore"),
        ("Ag Belt Nested Wells", 39.55, -75.95, "Cecil"),
        ("Coastal Plain Deep", 38.35, -76.50, "Calvert"),
    ]
    rng = np.random.default_rng(99)
    for i, (name, lat, lon, county) in enumerate(labels):
        feats = {
            "nitrate_mg_l": float(rng.uniform(1, 22)),
            "ph": float(rng.uniform(6.0, 8.2)),
            "turbidity_ntu": float(rng.uniform(0.5, 18)),
            "ag_proximity_km": float(rng.uniform(0.2, 12)),
            "industry_proximity_km": float(rng.uniform(0.3, 18)),
            "well_depth_m": float(rng.uniform(12, 70)),
            "rainfall_30d_mm": float(rng.uniform(20, 160)),
        }
        # nudge a couple sites toward elevated risk
        if i in (5, 6):
            feats["nitrate_mg_l"] = float(rng.uniform(14, 28))
            feats["ag_proximity_km"] = float(rng.uniform(0.1, 1.2))
            feats["industry_proximity_km"] = float(rng.uniform(0.2, 2.0))
        sites.append(
            {
                "id": f"site-{i+1:02d}",
                "name": name,
                "county": county,
                "lat": lat,
                "lon": lon,
                "features": feats,
            }
        )
    (MODEL_DIR / "sites.json").write_text(json.dumps({"sites": sites}, indent=2))

    print("Wrote model/model.json, model/metrics.json, model/sites.json")
    print(
        f"Test accuracy={metrics['accuracy']:.3f} ROC-AUC={metrics['roc_auc']:.3f} "
        f"Brier={metrics['brier']:.3f}"
    )


if __name__ == "__main__":
    main()
