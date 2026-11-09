# Proof Debugger (CMSC250)

**Natural-deduction proof checker with an OCaml core** — the verifier is a real logic engine, not an LLM judge.

Students paste a stepwise propositional proof. The OCaml engine parses each inference, stops at the **first invalid step**, and explains exactly why (with a repair hint). A light optional layer can sketch informal English → formal steps. The TA dashboard clusters recurring mistake patterns across submissions.

## Why this exists

- CMSC250-style proofs fail in silent, structural ways (wrong MP conclusion, bad ∧-elim, undischarged assumptions)
- LLM-as-grader hallucinates validity; a kernel of inference rules does not
- TAs need pattern clusters (“modus_ponens_misapply × 14”) not one-off comments

## Architecture

```
proof text  →  OCaml proof_check  →  JSON { ok | first error + pattern }
                    ↑
              Node Express API + TA store
                    ↑
         optional informal→formal sketch (heuristic / optional LLM)
```

## Proof DSL

```
goal: Q
P1: P           [Premise]
P2: P -> Q      [Premise]
S3: Q           [MP P1 P2]
```

Supported rules include Premise, Assumption, Reit, MP, MT, ∧I/E, ∨I, →I (with `{discharge Id}`), ¬I/E, ⊥E, DNE, Contradiction.

## Run

```bash
# requires ocaml + dune (apt: ocaml ocaml-dune)
cd projects/proof-debugger
npm install
npm run build:ocaml
npm run seed
npm run dev
# http://localhost:4700
```

```bash
# CLI
./ocaml/_build/default/bin/main.exe ocaml/examples/invalid_mp.proof
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/check` | Check a proof (OCaml engine) |
| POST | `/api/informal` | Optional informal → formal sketch |
| POST | `/api/submit` | Store student attempt for TA clustering |
| GET | `/api/ta/clusters` | Mistake pattern clusters |
| GET | `/api/ta/recent` | Recent submissions |
