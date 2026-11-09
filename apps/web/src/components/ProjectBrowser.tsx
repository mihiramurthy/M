"use client";

import { useState } from "react";
import { extraProjects, featuredProjects } from "@/content/projects";
import { ProjectShowcaseCard } from "@/components/ProjectMockup";

export function ProjectBrowser() {
  const [tab, setTab] = useState<"featured" | "extras">("featured");
  const list = tab === "featured" ? featuredProjects : extraProjects;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 pb-8 pt-6 md:px-10">
      <div className="mb-8 flex gap-6 border-b border-black/10 text-sm">
        {(
          [
            ["featured", "Featured"],
            ["extras", "Extras"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`pb-3 transition ${
              tab === id
                ? "border-b-2 border-ink font-semibold text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {list.map((p) => (
          <ProjectShowcaseCard key={p.slug} project={p} href={`/projects/${p.slug}`} />
        ))}
      </div>
    </section>
  );
}
