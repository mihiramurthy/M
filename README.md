# Mihira Murthy — Portfolio & original demos

Personal site + original CS demos (not employer/club rebuilds). Target host: **Vercel**.

## Status (WIP — 2026-10-22)

In progress on branch `cursor/portfolio-original-demos-52db`.

### Projects chosen

| Slug | Focus | Problem |
|------|--------|---------|
| **CareAtlas** | Fullstack | Access-to-care matching (sliding-scale, language, specialty) + visit prep |
| **ClaimTrail** | Backend / agents | Claim provenance pipeline (queue workers, trust score, observability) |
| **AquiferNet** | ML + UI | Groundwater contamination risk model + interactive explorer |
| **Wattline** | Frontend / viz | Grid carbon intensity & demand-response planner |
| **LoanLattice** | Fullstack / finance | Student loan repayment strategy lab (IDR vs standard) |

### Done tonight

- Monorepo scaffold (`apps/web` Next.js shell, `projects/*`)
- **CareAtlas** — runnable Express app (match engine, seed data, UI, tests)
- **ClaimTrail** — runnable Express pipeline (workers, scoring, UI, tests)
- Resume PDF copied to `public/`
- Portfolio Next.js config/tailwind started (pages/UI not built yet)

### Resume tomorrow

```bash
npm install
cd projects/care-atlas && npm install && npm run seed && npm run dev   # :4100
cd projects/claim-trail && npm install && npm run dev                  # :4200
# then: AquiferNet, Wattline, LoanLattice → portfolio case studies → Vercel
```

See `/cursor/stores/self/internal/handoff-2026-10-22.md` in the Project store for the full handoff.
