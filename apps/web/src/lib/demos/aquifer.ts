import modelJson from "./aquifer-model/model.json";
import metricsJson from "./aquifer-model/metrics.json";
import sitesJson from "./aquifer-model/sites.json";

export type AquiferModel = {
  features: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  coefficients: number[];
  intercept: number;
  threshold: number;
};

export const model = modelJson as AquiferModel;
export const metrics = metricsJson as {
  accuracy: number;
  roc_auc: number;
  brier: number;
  n_train: number;
  n_test: number;
  notes: string;
};
export const sites = (
  sitesJson as {
    sites: {
      id: string;
      name: string;
      county: string;
      lat: number;
      lon: number;
      features: Record<string, number>;
    }[];
  }
).sites;

export function predictRisk(features: Record<string, number>, m: AquiferModel = model) {
  const x = m.features.map((name) => {
    const v = Number(features[name]);
    if (Number.isNaN(v)) throw new Error(`Missing feature: ${name}`);
    return v;
  });
  const z = x.map((v, i) => (v - m.scaler_mean[i]) / m.scaler_scale[i]);
  let logit = m.intercept;
  const contributions = m.features.map((feature, i) => {
    const contribution = m.coefficients[i] * z[i];
    logit += contribution;
    return { feature, value: x[i], standardized: z[i], contribution };
  });
  const probability = 1 / (1 + Math.exp(-logit));
  const label = probability >= (m.threshold ?? 0.5) ? "elevated_risk" : "low_risk";
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const band = probability >= 0.7 ? "high" : probability >= 0.4 ? "moderate" : "low";
  return { probability, label, band, topDrivers: contributions.slice(0, 4) };
}
