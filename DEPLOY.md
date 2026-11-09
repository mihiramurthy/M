# Deploy the portfolio on Vercel (Hobby / free)

**Goal:** ship **https://github.com/mihiramurthy/M** as a free Vercel site now. Custom domain later.  
**Secrets:** none required for the public portfolio or embedded demos.

This repo is an **npm workspaces monorepo**. The Next.js site lives in `apps/web`. Root `vercel.json` already points Vercel at the right install/build commands — prefer deploying from the **repo root**.

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Root Directory | `.` (repository root) — leave blank / `/` |
| Node.js version | **20.x** (Project Settings → General → Node.js Version) |
| Install Command | `npm install` |
| Build Command | `npm run build -w @mihira/web` |
| Output | Next.js default (do **not** set a static Output Directory) |
| Environment variables | **None** |

`vercel.json` at the repo root:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build -w @mihira/web"
}
```

---

## A. Get the code onto the branch Vercel will build

PR **#1** is open: [Portfolio site — designer-level polish + original demos](https://github.com/mihiramurthy/M/pull/1)  
Head branch: `cursor/portfolio-original-demos-52db` → base: `main`

**This agent cannot merge for you** without your GitHub approval. Pick one path:

### Path 1 — Merge PR #1 into `main` (recommended for “production”)

1. Open https://github.com/mihiramurthy/M/pull/1 while signed in as a repo admin/collaborator.
2. Review the Files changed tab if you want.
3. Click **Merge pull request** (green button near the bottom of the Conversation tab).
4. Confirm with **Confirm merge**.
5. Optional: **Delete branch** after merge.
6. In Vercel (below), Production Branch = `main`.

### Path 2 — Deploy the PR branch first (no merge yet)

1. Skip merging.
2. In Vercel project settings, set Production Branch to `cursor/portfolio-original-demos-52db`  
   **or** open the Deployment from the Git integration for that branch / the PR preview.
3. Merge PR #1 later when ready; then switch Production Branch back to `main`.

---

## B. Create the Vercel Hobby project (click path)

1. Go to https://vercel.com/signup (or https://vercel.com/login).
2. Choose **Continue with GitHub** and authorize the **mihiramurthy** account if prompted.
3. Confirm you’re on the **Hobby** (free) plan — new personal accounts default here.
4. Dashboard → **Add New…** → **Project**.
5. Under **Import Git Repository**, find **`mihiramurthy/M`**.
   - If missing: **Adjust GitHub App Permissions** / **Configure** → grant access to that repo → refresh.
6. Click **Import** next to `M`.

### Configure (before Deploy)

7. **Project Name** — e.g. `mihira-murthy` (becomes `*.vercel.app`).
8. **Framework Preset** — **Next.js**.
9. **Root Directory** — click **Edit** → leave as **repository root** (`.` / empty).  
   Do **not** set `apps/web` unless you follow the alternate note below.
10. **Build and Output Settings** → open overrides if needed:
    - **Install Command:** `npm install`
    - **Build Command:** `npm run build -w @mihira/web`
    - **Output Directory:** leave **empty** (Next.js, not static export)
11. **Environment Variables** — leave empty (no secrets).
12. Click **Deploy**. Wait for the build to go green.
13. Open the `*.vercel.app` URL → smoke-check:
    - `/`
    - Projects / Past work tabs
    - `/demos/token-lens`, `/demos/proof-debugger`, `/demos/concurrency-finder`
    - `/Mihira_Murthy_Resume.pdf`

### Node.js version (do this once after first deploy if needed)

14. Project → **Settings** → **General** → **Node.js Version** → **20.x** → Save.  
15. **Deployments** → ⋮ on latest → **Redeploy** if the first build used an older Node.

---

## Alternate: Root Directory = `apps/web`

Only if root + `vercel.json` misbehaves:

| Setting | Value |
|---------|--------|
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && npm install` |
| Build Command | `cd ../.. && npm run build -w @mihira/web` |

Workspaces install from the monorepo root; building only inside `apps/web` without the root install will fail.

**Preferred:** Root Directory = `.` + existing `vercel.json`.

---

## Custom domain (later)

1. Vercel project → **Settings** → **Domains** → **Add**.
2. Enter the domain → follow DNS (usually `A` / `CNAME` to Vercel).
3. Wait for SSL. No app code changes required.

---

## Local check (optional)

```bash
npm install
npm run build          # same as Vercel: builds @mihira/web
npm run start          # http://localhost:3000
```

Standalone demos under `projects/*` (TokenLens `:4600`, Proof Debugger `:4700`, Concurrency Finder `:4800`, etc.) are **local/dev** servers. The Vercel site serves the portfolio + **client-side / embedded** demos under `/demos/*` — still **no env secrets**.

---

## Go-live checklist

- [ ] Merge PR #1 **or** point Vercel at `cursor/portfolio-original-demos-52db`
- [ ] Import `mihiramurthy/M` on Vercel Hobby
- [ ] Root Directory = repo root; Node **20.x**
- [ ] Install `npm install` · Build `npm run build -w @mihira/web` · no Output Directory
- [ ] No environment variables
- [ ] Smoke-test home, Past work, `/demos/*`, resume PDF
- [ ] (Later) custom domain under Settings → Domains
