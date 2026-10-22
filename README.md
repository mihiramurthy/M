# Mihira Murthy — Portfolio & original demos

Recruiter-facing personal site plus **original** CS demos (not employer/club rebuilds). Live host: **Vercel**.

## Quick start (portfolio)

```bash
npm install
npm run dev
# http://localhost:3000
```

- Home: About, Experience, Projects (filterable), Skills, Contact, internship slot
- Case studies: `/projects/[slug]`
- Live demos: `/demos/[slug]`
- Resume: `/Mihira_Murthy_Resume.pdf`

## Original projects

| Project | Focus | Standalone | Live demo |
|---------|--------|------------|-----------|
| **CareAtlas** | Fullstack — access-to-care matching | `:4100` | `/demos/care-atlas` |
| **ClaimTrail** | Backend — claim provenance pipeline | `:4200` | `/demos/claim-trail` |
| **AquiferNet** | ML — groundwater risk | `:4300` | `/demos/aquifer-net` |
| **Wattline** | Frontend — grid carbon planner | `:4400` | `/demos/wattline` |
| **LoanLattice** | Fullstack — student loan strategies | `:4500` | `/demos/loan-lattice` |

```bash
# examples
cd projects/care-atlas && npm install && npm run seed && npm run dev
cd projects/aquifer-net && pip install -r requirements.txt && npm run train && npm run dev
```

Each project has its own README, tests (`npm test`), and runnable UI.

## Deploy

See [DEPLOY.md](./DEPLOY.md). Import the GitHub repo into Vercel; no env secrets required for the public site.

## Constraint

Resume content appears in About / Experience / Education only. Demos are invented world-problem projects — not Exiger, Nokia, BAH, or ADC People Portal rebuilds.
