# TokenLens

**AI spend intelligence with evidence-based model routing.**

TokenLens sits as a thin proxy in front of OpenAI/Anthropic-compatible chat APIs. Every request is logged, classified by prompt complexity, attributed to a team, scored for output quality / hallucination risk, and evaluated for waste — so “use a cheaper model” is backed by quality evidence, not vibes.

## Why this exists

- LLM bills grow silently across teams with no shared view of *who* spends *on what*
- Blind cheaper-model routing tanks quality; TokenLens pairs cost with quality scores
- Recruiters can exercise a real proxy + dashboard without production API keys (mock providers included)

## Features

- **Proxy logging** for `/v1/chat/completions` (OpenAI-style) and `/v1/messages` (Anthropic-style)
- **Prompt complexity** classifier (`trivial` → `reasoning`)
- **Team cost attribution** via `x-team-id` header or body field
- **Waste detection** + cheaper-model recommendations when quality headroom allows
- **Output-quality / hallucination scoring** (grounding, hedging, contradiction, numeric consistency heuristics)
- **Polylane-inspired dashboard** — sparse light UI, lime accents, spend/quality graphs

## Run

```bash
cd projects/token-lens
npm install
npm run seed    # optional synthetic traffic
npm run dev     # http://localhost:4600
```

Optional real providers (otherwise mocks):

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Try the proxy

```bash
curl -s http://localhost:4600/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-team-id: platform' \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role":"user","content":"Summarize the capital of France in one sentence."}
    ]
  }' | jq .
```

Dashboard: http://localhost:4600  
API: `GET /api/overview`, `GET /api/requests`, `GET /api/recommendations`
