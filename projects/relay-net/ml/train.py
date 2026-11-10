#!/usr/bin/env python3
"""Train RelayNet: TensorFlow Conv1D early warning for microservice SLO breaches.

Synthetic golden-signal windows → Keras Conv1D classifier → portable JSON for JS inference.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "model"

CHANNELS = [
    "latency_p95_ms",
    "error_rate",
    "cpu_util",
    "mem_util",
    "rps",
    "queue_depth",
    "gc_pause_ms",
    "downstream_p95_ms",
]
CLASSES = ["healthy", "latency_risk", "error_risk", "saturation_risk"]
T = 32  # timesteps in each window
F = len(CHANNELS)
SEED = 42


def synthesize(n: int = 4800, seed: int = SEED) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    X = np.zeros((n, T, F), dtype=np.float32)
    y = np.zeros(n, dtype=np.int32)

    for i in range(n):
        label = int(rng.integers(0, 4))
        y[i] = label

        # Baseline healthy telemetry
        lat = rng.normal(120, 18, T)
        err = rng.beta(1.2, 40, T) * 0.04
        cpu = rng.normal(0.42, 0.08, T).clip(0.05, 0.98)
        mem = rng.normal(0.55, 0.07, T).clip(0.1, 0.98)
        rps = rng.normal(180, 25, T).clip(20, 600)
        queue = rng.normal(4, 1.5, T).clip(0, 80)
        gc = rng.normal(8, 2.5, T).clip(1, 80)
        down = rng.normal(90, 15, T).clip(20, 500)

        t = np.linspace(0, 1, T)
        strength = float(rng.uniform(0.55, 1.0))
        if label == 1:  # latency risk: rising p95 + downstream drag
            lat = lat + strength * (25 + 140 * (t ** 1.6)) + rng.normal(0, 14, T)
            down = down + strength * (20 + 100 * (t ** 1.4))
            queue = queue + strength * 7 * t
            # occasional confusion with saturation
            if rng.random() < 0.2:
                cpu = (cpu + 0.12 * t).clip(0.05, 0.99)
        elif label == 2:  # error risk: error spikes with mild latency
            burst = (t > float(rng.uniform(0.4, 0.7))).astype(float)
            err = err + strength * (0.015 + 0.14 * burst) + np.abs(rng.normal(0, 0.015, T))
            lat = lat + strength * 30 * burst + rng.normal(0, 12, T)
            rps = rps + strength * 35 * burst
        elif label == 3:  # saturation risk: CPU/mem climb, GC, queue
            cpu = (cpu + strength * (0.12 + 0.4 * t)).clip(0.05, 0.99)
            mem = (mem + strength * (0.08 + 0.32 * t)).clip(0.1, 0.99)
            gc = gc + strength * (4 + 35 * (t ** 2)) + rng.normal(0, 4, T)
            queue = queue + strength * (2 + 22 * t)
            lat = lat + strength * 18 * t + rng.normal(0, 10, T)
        else:
            # healthy with mild noise / rare blips
            if rng.random() < 0.15:
                lat = lat + rng.normal(15, 8, T)

        # shared observation noise
        lat = lat + rng.normal(0, 8, T)
        err = (err + rng.normal(0, 0.004, T)).clip(0, 1)
        cpu = (cpu + rng.normal(0, 0.03, T)).clip(0.05, 0.99)
        mem = (mem + rng.normal(0, 0.03, T)).clip(0.1, 0.99)

        X[i, :, 0] = lat.astype(np.float32)
        X[i, :, 1] = err.astype(np.float32)
        X[i, :, 2] = cpu.astype(np.float32)
        X[i, :, 3] = mem.astype(np.float32)
        X[i, :, 4] = rps.astype(np.float32)
        X[i, :, 5] = queue.astype(np.float32)
        X[i, :, 6] = gc.astype(np.float32)
        X[i, :, 7] = down.astype(np.float32)

    # Label noise keeps eval honest on separable synthetic regimes
    flip = rng.random(n) < 0.08
    y = y.copy()
    y[flip] = rng.integers(0, 4, flip.sum())
    return X, y


def channel_stats(X: np.ndarray) -> dict:
    """Per-channel mean/std for portable standardization in JS."""
    flat = X.reshape(-1, F)
    return {
        "mean": flat.mean(axis=0).tolist(),
        "std": np.maximum(flat.std(axis=0), 1e-6).tolist(),
    }


def standardize(X: np.ndarray, mean: np.ndarray, std: np.ndarray) -> np.ndarray:
    return (X - mean) / std


def build_model() -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(T, F), name="window")
    x = tf.keras.layers.Conv1D(32, 5, padding="same", activation="relu")(inputs)
    x = tf.keras.layers.Conv1D(64, 3, padding="same", activation="relu")(x)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(64, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(len(CLASSES), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs, name="relay_net")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def export_weights(model: tf.keras.Model) -> dict:
    """Serialize Conv1D + Dense layers for a matching JS forward pass."""
    layers_out = []
    for layer in model.layers:
        cfg = {"name": layer.name, "type": layer.__class__.__name__}
        weights = layer.get_weights()
        if not weights:
            if isinstance(layer, tf.keras.layers.Dropout):
                continue
            if isinstance(layer, tf.keras.layers.InputLayer):
                continue
            if isinstance(layer, tf.keras.layers.GlobalAveragePooling1D):
                layers_out.append({**cfg, "op": "gap1d"})
            continue
        if isinstance(layer, tf.keras.layers.Conv1D):
            kernel, bias = weights  # (K, F_in, F_out)
            layers_out.append(
                {
                    **cfg,
                    "op": "conv1d",
                    "kernel": kernel.tolist(),
                    "bias": bias.tolist(),
                    "activation": "relu",
                    "padding": "same",
                }
            )
        elif isinstance(layer, tf.keras.layers.Dense):
            kernel, bias = weights
            act = "softmax" if layer.activation.__name__ == "softmax" else "relu"
            if layer.activation.__name__ == "linear":
                act = "linear"
            layers_out.append(
                {
                    **cfg,
                    "op": "dense",
                    "kernel": kernel.tolist(),
                    "bias": bias.tolist(),
                    "activation": act,
                }
            )
        elif isinstance(layer, tf.keras.layers.GlobalAveragePooling1D):
            layers_out.append({**cfg, "op": "gap1d"})
    return {"layers": layers_out}


def main() -> None:
    tf.keras.utils.set_random_seed(SEED)
    X, y = synthesize()
    stats = channel_stats(X)
    mean = np.array(stats["mean"], dtype=np.float32)
    std = np.array(stats["std"], dtype=np.float32)
    Xs = standardize(X, mean, std)

    X_train, X_test, y_train, y_test = train_test_split(
        Xs, y, test_size=0.25, random_state=7, stratify=y
    )

    model = build_model()
    model.fit(
        X_train,
        y_train,
        validation_split=0.15,
        epochs=12,
        batch_size=64,
        verbose=2,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor="val_accuracy", patience=3, restore_best_weights=True
            )
        ],
    )

    proba = model.predict(X_test, verbose=0)
    pred = proba.argmax(axis=1)
    acc = float((pred == y_test).mean())
    report = classification_report(
        y_test, pred, target_names=CLASSES, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_test, pred).tolist()

    # Example windows for the demo (raw + standardized)
    demo_idx = []
    for c in range(4):
        hits = np.where(y_test == c)[0]
        demo_idx.append(int(hits[0]))
    examples = []
    # Need raw windows corresponding to test set: recover from Xs inverse is fine for display
    for ti in demo_idx:
        raw = (X_test[ti] * std) + mean
        examples.append(
            {
                "label": CLASSES[int(y_test[ti])],
                "window": raw.tolist(),
                "channels": CHANNELS,
            }
        )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    artifact = {
        "name": "RelayNet",
        "framework": "tensorflow/keras",
        "version": 1,
        "timesteps": T,
        "channels": CHANNELS,
        "classes": CLASSES,
        "scaler": stats,
        "model": export_weights(model),
    }
    metrics = {
        "n_train": int(len(y_train)),
        "n_test": int(len(y_test)),
        "accuracy": acc,
        "macro_f1": float(report["macro avg"]["f1-score"]),
        "classification_report": report,
        "confusion_matrix": cm,
        "epochs_policy": "EarlyStopping on val_accuracy, max 12",
        "notes": (
            "Synthetic golden-signal windows for reproducible demos. "
            "Not a production SRE model."
        ),
    }

    (MODEL_DIR / "model.json").write_text(json.dumps(artifact, indent=2))
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))
    (MODEL_DIR / "examples.json").write_text(json.dumps(examples, indent=2))

    # Keras save for local retrain inspection (optional, gitignored heavy files avoided)
    print(json.dumps({"accuracy": acc, "macro_f1": metrics["macro_f1"]}, indent=2))


if __name__ == "__main__":
    main()
