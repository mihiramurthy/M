/** Portable logistic inference matching Python StandardScaler + LogisticRegression export. */

export function predictRisk(model, features) {
  const x = model.features.map((name) => {
    const v = Number(features[name]);
    if (Number.isNaN(v)) throw new Error(`Missing feature: ${name}`);
    return v;
  });

  const z = x.map((v, i) => (v - model.scaler_mean[i]) / model.scaler_scale[i]);
  let logit = model.intercept;
  const contributions = [];
  for (let i = 0; i < z.length; i++) {
    const c = model.coefficients[i] * z[i];
    logit += c;
    contributions.push({
      feature: model.features[i],
      value: x[i],
      standardized: z[i],
      contribution: c,
    });
  }

  const probability = 1 / (1 + Math.exp(-logit));
  const threshold = model.threshold ?? 0.5;
  const label = probability >= threshold ? "elevated_risk" : "low_risk";

  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return {
    probability,
    label,
    threshold,
    topDrivers: contributions.slice(0, 4),
  };
}

export function bandFor(probability) {
  if (probability >= 0.7) return "high";
  if (probability >= 0.4) return "moderate";
  return "low";
}
