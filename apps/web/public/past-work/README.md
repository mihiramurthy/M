# Past work screenshots

Web-optimized WEBP slides for the portfolio **Past work** tab.

## Layout

```
public/past-work/<project-slug>/slide-01.webp …
```

Wire a project in `apps/web/src/content/pastWork.ts` (slug, copy from resume accuracy, `slides[]`).

## Adding a batch

1. Drop PNGs under `/cursor/stores/self/media/past-work/batch-NN/`
2. Crop/remove red annotations, export WEBP (~1400px wide) into the right slug folder
3. Append slide entries (and optionally a new project object) in `pastWork.ts`

No source / demo links — screenshot proof only.
