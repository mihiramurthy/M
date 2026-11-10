# RelayNet

TensorFlow Conv1D early warning for microservice SLO breaches from golden signal windows.

## Why it exists

SRE dashboards show latency, errors, saturation, and traffic. RelayNet turns a short window of those signals into a class label (`healthy`, `latency_risk`, `error_risk`, `saturation_risk`) with portable inference you can run in Node or the portfolio demo.

## Stack

- Python + TensorFlow/Keras training
- Portable JSON weights for JS Conv1D → GAP → Dense forward pass
- Express demo UI

## Run

```bash
cd projects/relay-net
python3 -m pip install -r requirements.txt
npm install
npm run train
npm test
npm run dev
# http://localhost:4310
```

Artifacts land in `model/model.json`, `model/metrics.json`, and `model/examples.json`.
