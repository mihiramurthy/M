import modelJson from "./relay-net/model.json";
import metricsJson from "./relay-net/metrics.json";
import examplesJson from "./relay-net/examples.json";

export type RelayArtifact = {
  name: string;
  timesteps: number;
  channels: string[];
  classes: string[];
  scaler: { mean: number[]; std: number[] };
  model: {
    layers: Array<{
      op: string;
      kernel?: number[][][] | number[][];
      bias?: number[];
      activation?: string;
    }>;
  };
};

export const artifact = modelJson as RelayArtifact;
export const metrics = metricsJson as {
  accuracy: number;
  macro_f1: number;
  n_train: number;
  n_test: number;
  confusion_matrix: number[][];
};
export const examples = examplesJson as {
  label: string;
  window: number[][];
  channels: string[];
}[];

function relu(x: number) {
  return x > 0 ? x : 0;
}

function softmax(logits: number[]) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

function standardizeWindow(window: number[][], scaler: RelayArtifact["scaler"]) {
  return window.map((row) => row.map((v, i) => (v - scaler.mean[i]) / scaler.std[i]));
}

function conv1dSame(input: number[][], kernel: number[][][], bias: number[]) {
  const T = input.length;
  const K = kernel.length;
  const Fin = kernel[0].length;
  const Fout = kernel[0][0].length;
  const pad = Math.floor(K / 2);
  const out = Array.from({ length: T }, () => Array(Fout).fill(0));

  for (let t = 0; t < T; t++) {
    for (let o = 0; o < Fout; o++) {
      let sum = bias[o];
      for (let k = 0; k < K; k++) {
        const src = t + k - pad;
        if (src < 0 || src >= T) continue;
        for (let i = 0; i < Fin; i++) sum += input[src][i] * kernel[k][i][o];
      }
      out[t][o] = relu(sum);
    }
  }
  return out;
}

function gap1d(input: number[][]) {
  const T = input.length;
  const F = input[0].length;
  const out = Array(F).fill(0);
  for (let t = 0; t < T; t++) for (let f = 0; f < F; f++) out[f] += input[t][f];
  return out.map((v) => v / T);
}

function dense(vec: number[], kernel: number[][], bias: number[], activation: string) {
  const out = bias.map((b, o) => {
    let sum = b;
    for (let i = 0; i < vec.length; i++) sum += vec[i] * kernel[i][o];
    return sum;
  });
  if (activation === "relu") return out.map(relu);
  if (activation === "softmax") return softmax(out);
  return out;
}

export function predictWindow(window: number[][]) {
  let x: number[][] | null = standardizeWindow(window, artifact.scaler);
  let vec: number[] | null = null;

  for (const layer of artifact.model.layers) {
    if (layer.op === "conv1d") {
      x = conv1dSame(x!, layer.kernel as number[][][], layer.bias!);
    } else if (layer.op === "gap1d") {
      vec = gap1d(x!);
      x = null;
    } else if (layer.op === "dense") {
      vec = dense(vec!, layer.kernel as number[][], layer.bias!, layer.activation || "linear");
    }
  }

  const probabilities = Object.fromEntries(artifact.classes.map((c, i) => [c, vec![i]]));
  let bestI = 0;
  for (let i = 1; i < vec!.length; i++) if (vec![i] > vec![bestI]) bestI = i;

  const channelEnergy = artifact.channels.map((name, i) => {
    let energy = 0;
    for (let t = 0; t < window.length; t++) {
      const z = (window[t][i] - artifact.scaler.mean[i]) / artifact.scaler.std[i];
      energy += z * z;
    }
    return { channel: name, energy: energy / window.length };
  });
  channelEnergy.sort((a, b) => b.energy - a.energy);

  return {
    label: artifact.classes[bestI],
    confidence: vec![bestI],
    probabilities,
    topChannels: channelEnergy.slice(0, 4),
  };
}
