"use client";

import { useState } from "react";
import { featuredProjects } from "@/content/projects";
import { pastWorkProjects } from "@/content/pastWork";
import { ProjectShowcaseCard } from "@/components/ProjectMockup";
import { PastWorkCard } from "@/components/PastWorkCard";

export function ProjectBrowser() {
  const [tab, setTab] = useState<"projects" | "past">("projects");

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 pb-8 pt-6 md:px-10">
      <div className="mb-8 flex gap-6 border-b border-black/10 text-sm">
        {(
          [
            ["projects", "Projects"],
            ["past", "Past work"],
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

      {tab === "projects" ? (
        <div className="grid gap-5 md:grid-cols-2">
          {featuredProjects.map((p) => (
            <ProjectShowcaseCard key={p.slug} project={p} href={`/projects/${p.slug}`} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Past work</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Private & club screenshots
            </h3>
            <p className="mt-3 text-ink-muted">
              Revolving case studies from internship and App Dev Club work. Each carousel is
              screenshot-proof only — no source links. More batches can drop into{" "}
              <code className="text-xs">public/past-work/&lt;slug&gt;/</code> and extend the
              content file.
            </p>
          </div>
          {pastWorkProjects.map((p) => (
            <PastWorkCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
