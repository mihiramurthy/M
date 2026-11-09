# Deploy — Vercel

## Recommended setup

1. Import **https://github.com/mihiramurthy/M** into Vercel.
2. Framework: **Next.js**
3. Root directory: repository root (uses `vercel.json`)
4. Build command: `npm run build -w @mihira/web`
5. Install: `npm install`
6. Output: Next default via workspace (`apps/web`)

If the Vercel UI asks for Root Directory, either leave `/` with the `vercel.json` above, **or** set Root Directory to `apps/web` and use default Next build (`npm run build` inside that package — ensure workspace hoisting still works; simplest is root + vercel.json).

## Environment

No secrets required for the public portfolio or embedded demos. All demos run client-side / with bundled model JSON.

## Local portfolio

```bash
npm install
npm run dev
# http://localhost:3000
```

## Standalone demos

| Project | Port | Command |
|---------|------|---------|
| CareAtlas | 4100 | `cd projects/care-atlas && npm run seed && npm run dev` |
| ClaimTrail | 4200 | `cd projects/claim-trail && npm run dev` |
| AquiferNet | 4300 | `cd projects/aquifer-net && npm run train && npm run dev` |
| Wattline | 4400 | `cd projects/wattline && npm run dev` |
| LoanLattice | 4500 | `cd projects/loan-lattice && npm run dev` |

## Go-live checklist

- [ ] Connect GitHub repo to a Vercel project (needs account access)
- [ ] Optional custom domain
- [ ] Confirm `/Mihira_Murthy_Resume.pdf` downloads
- [ ] Smoke-test `/demos/*` routes after deploy
