# ClaimTrail

**Content provenance & claim-lineage pipeline for a misinformation-saturated web.**

When a claim spreads, people need more than a binary “true/false” badge. ClaimTrail ingests a URL or claim text, enqueues specialized workers (archive lookup, domain age, cross-source agreement, linguistic urgency heuristics), and emits an explainable trust report with observability hooks.

External services (Wayback, WHOIS, fact-check APIs) are **mocked with deterministic fixtures** so the architecture is real and runnable offline.

## Why this exists

- Synthetic media and recycled screenshots outrun manual verification
- Consumers get polarity (“fake!”) without provenance
- Newsrooms and platforms need queueable, observable pipelines — not one-shot classifiers

## Architecture

```
POST /api/jobs  →  IngestQueue
                    ├─ archiveWorker   (mock Wayback age / captures)
                    ├─ domainWorker    (mock registration age / hosting)
                    ├─ agreementWorker (cross-source overlap)
                    └─ urgencyWorker   (linguistic pressure heuristics)
                 →  TrustScorer → Job store + event log
```

## Run

```bash
cd projects/claim-trail
npm install
npm run dev
# open http://localhost:4200
```

## Try it

```bash
curl -s -X POST http://localhost:4200/api/jobs \
  -H 'content-type: application/json' \
  -d '{"url":"https://example-news.test/story/grid-outage","claim":"The entire Eastern grid failed last night"}'
```
