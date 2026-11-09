# Deploy the portfolio on Vercel (Hobby / free)

**Goal:** ship **https://github.com/mihiramurthy/M** on Vercel Hobby. Custom domain later.  
**Secrets:** none.

This is an **npm workspaces monorepo**. The Next.js app is **`apps/web`**.  
Vercel must use **Root Directory = `apps/web`** so it finds `.next` after `next build`. Deploying with Root = `./` leaves `.next` under `apps/web/` while Vercel looks at the repo root → **`NEXT_OUTPUT_DIR_MISSING`**.

## Canonical settings (copy these)

| Vercel field | Value |
|--------------|--------|
| Framework Preset | **Next.js** |
| **Root Directory** | **`apps/web`** (Edit → select that folder) |
| Node.js Version | **20.x** (Settings → General) |
| Install Command | *(default)* — leave override **off**. Vercel installs workspaces from the monorepo root when Root Directory is a workspace package. |
| Build Command | *(default)* `npm run build` / Next — leave override **off** |
| **Output Directory** | **Empty / override OFF** — never set `.next`, `./`, or `apps/web/.next` |
| Environment Variables | **None** |

`apps/web/vercel.json`:

```json
{ "framework": "nextjs" }
```

Do **not** set `outputDirectory` in `vercel.json` for this Next app.

---

## Fix an existing failed project (`m` on Hobby)

If deploy failed with **`NEXT_OUTPUT_DIR_MISSING`**:

1. Open the project on https://vercel.com → project **`m`**.
2. **Settings** → **General** → **Root Directory** → **Edit** → set to **`apps/web`** → **Save**.
3. **Settings** → **Build & Development Settings**:
   - **Output Directory** → turn **Override OFF** (or clear the value so it is empty).  
     Wrong values that break Next: `.next`, `./`, `apps/web/.next`, `dist`, `build`.
   - **Install Command** → Override **OFF** (recommended)  
     or Override ON with: `cd ../.. && npm install`
   - **Build Command** → Override **OFF** (recommended)  
     or Override ON with: `npm run build`
   - **Framework Preset** → **Next.js**
4. **Settings** → **General** → **Node.js Version** → **20.x** → Save.
5. **Deployments** → open the failed deployment → **Redeploy**  
   (or **Deployments** → **Create Deployment** → branch **`main`**).  
   Check **Use existing Build Cache** → prefer **unchecked** once after the settings change.

After a green deploy, smoke-test `/`, Past work, `/demos/*`, `/Mihira_Murthy_Resume.pdf`.

---

## New project import (if starting fresh)

1. https://vercel.com → **Add New…** → **Project** → import **`mihiramurthy/M`**.
2. Before Deploy:
   - **Root Directory** → **Edit** → **`apps/web`**
   - Framework **Next.js**
   - Do **not** fill Output Directory
   - No env vars
3. **Deploy**.

Production branch should be **`main`** (PR #1 already merged).

---

## Why not Root Directory = `./`?

| Root Directory | Where `next build` writes | What Vercel expects |
|----------------|---------------------------|---------------------|
| `./` (repo root) + `npm run build -w @mihira/web` | `apps/web/.next` | `.next` at repo root → **missing** |
| **`apps/web`** | `apps/web/.next` | `.next` in Root Directory → **OK** |

A root `vercel.json` with `"outputDirectory": "apps/web/.next"` is **wrong** for Next.js (Vercel then treats the app like a static export and still errors). Prefer Root Directory = `apps/web`.

---

## Custom domain (later)

**Settings** → **Domains** → **Add** → follow DNS. No code changes.

---

## Local check

```bash
npm install
npm run build -w @mihira/web   # writes apps/web/.next
npm run start -w @mihira/web
```

Standalone servers under `projects/*` are local only; Vercel serves the site + `/demos/*` with **no secrets**.
