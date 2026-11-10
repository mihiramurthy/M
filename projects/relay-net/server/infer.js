/** Portable RelayNet forward pass matching Keras Conv1D → GAP → Dense export. */

function relu(x) {
  return x > 0 ? x : 0;
}

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

function standardizeWindow(window, scaler) {
  // window: T x F
  return window.map((row) =>
    row.map((v, i) => (v - scaler.mean[i]) / scaler.std[i])
  );
}

function conv1dSame(input, kernel, bias) {
  // input: T x Fin, kernel: K x Fin x Fout
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
        for (let i = 0; i < Fin; i++) {
          sum += input[src][i] * kernel[k][i][o];
        }
      }
      out[t][o] = relu(sum);
    }
  }
  return out;
}

function gap1d(input) {
  const T = input.length;
  const F = input[0].length;
  const out = Array(F).fill(0);
  for (let t = 0; t < T; t++) {
    for (let f = 0; f < F; f++) out[f] += input[t][f];
  }
  return out.map((v) => v / T);
}

function dense(vec, kernel, bias, activation) {
  // kernel: in x out
  const outDim = bias.length;
  const out = Array(outDim).fill(0);
  for (let o = 0; o < outDim; o++) {
    let sum = bias[o];
    for (let i = 0; i < vec.length; i++) sum += vec[i] * kernel[i][o];
    out[o] = sum;
  }
  if (activation === "relu") return out.map(relu);
  if (activation === "softmax") return softmax(out);
  return out;
}

export function predictWindow(artifact, window) {
  if (!Array.isArray(window) || window.length !== artifact.timesteps) {
    throw new Error(`Expected window length ${artifact.timesteps}`);
  }
  let x = standardizeWindow(window, artifact.scaler);
  let vec = null;

  for (const layer of artifact.model.layers) {
    if (layer.op === "conv1d") {
      x = conv1dSame(x, layer.kernel, layer.bias);
    } else if (layer.op === "gap1d") {
      vec = gap1d(x);
    } else if (layer.op === "dense") {
      if (vec == null) throw new Error("Dense before GAP");
      vec = dense(vec, layer.kernel, layer.bias, layer.activation);
    }
  }

  const probabilities = Object.fromEntries(
    artifact.classes.map((c, i) => [c, vec[i]])
  );
  let bestI = 0;
  for (let i = 1; i < vec.length; i++) if (vec[i] > vec[bestI]) bestI = i;

  // Simple channel energy attribution on standardized window
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
    confidence: vec[bestI],
    probabilities,
    topChannels: channelEnergy.slice(0, 4),
  };
}

export function seriesForChannel(window, channelIndex) {
  return window.map((row) => row[channelIndex]);
}
