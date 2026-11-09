"use client";

import { useState } from "react";
import type { PastWorkProject } from "@/content/pastWork";
import { PastWorkCarousel } from "@/components/PastWorkCarousel";

const stageBg: Record<PastWorkProject["stage"], string> = {
  pine: "bg-stage-pine",
  slate: "bg-stage-slate",
  olive: "bg-stage-olive",
  cocoa: "bg-stage-cocoa",
  graphite: "bg-stage-graphite",
};

export function PastWorkCard({ project }: { project: PastWorkProject }) {
  const [open, setOpen] = useState(true);

  return (
    <article className="overflow-hidden rounded-showcase border border-black/5 bg-white shadow-float">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-start justify-between gap-4 px-6 py-5 text-left text-white md:px-8 md:py-6 ${stageBg[project.stage]}`}
      >
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            {project.tags.join(" · ")}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {project.name}
          </h3>
          <p className="mt-2 text-sm text-white/75">
            {project.role} · {project.org}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
            {project.dates} · {project.slides.length} slides · private screenshots
          </p>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          {open ? "Hide" : "Show"} carousel
        </span>
      </button>

      {open && (
        <div className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
          <div>
            <p className="text-sm leading-relaxed text-ink-soft">{project.summary}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-muted">
              {project.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              No source link · screenshot proof only
            </p>
          </div>
          <PastWorkCarousel slides={project.slides} />
        </div>
      )}
    </article>
  );
}
