"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { projects, type ProjectTag } from "@/content/projects";

const FILTERS: { id: "all" | ProjectTag; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fullstack", label: "Fullstack" },
  { id: "backend", label: "Backend" },
  { id: "ml", label: "ML" },
  { id: "frontend", label: "Frontend" },
];

export function ProjectFilters() {
  const [filter, setFilter] = useState<"all" | ProjectTag>("all");
  const visible = useMemo(
    () =>
      filter === "all" ? projects : projects.filter((p) => p.tags.includes(filter)),
    [filter]
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              filter === f.id
                ? "bg-signal text-ink-950"
                : "bg-ink-800 text-mist-300 hover:text-mist-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="space-y-0 divide-y divide-white/10 border-y border-white/10">
        {visible.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/projects/${p.slug}`}
              className="group grid gap-3 py-7 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-8"
            >
              <span className="font-mono text-xs text-mist-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-display text-2xl text-mist-50 transition group-hover:text-signal-bright md:text-3xl">
                    {p.name}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ember">
                    {p.tags.join(" · ")}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-mist-300">{p.tagline}</p>
              </div>
              <span className="text-sm text-signal opacity-0 transition group-hover:opacity-100">
                Case study →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
