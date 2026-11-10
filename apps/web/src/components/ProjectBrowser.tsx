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
            ["projects", "Projects", "tab-projects"],
            ["past", "Past work", "tab-past"],
          ] as const
        ).map(([id, label, tone]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`pb-3 transition ${tone} ${
              tab === id
                ? "is-active border-b-2 font-semibold"
                : "border-b-2 border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "projects" ? (
        <div className="space-y-6">
          <div className="max-w-2xl">
            <p className="section-eyebrow section-eyebrow--projects">Projects</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Interactive demos and case studies
            </h3>
            <p className="mt-3 text-ink-muted">
              Personal builds with runnable demos. Each case study covers problem framing,
              method, and what you can verify directly in the interface.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {featuredProjects.map((p) => (
              <ProjectShowcaseCard key={p.slug} project={p} href={`/projects/${p.slug}`} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="max-w-2xl">
            <p className="section-eyebrow section-eyebrow--past">Past work</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Partner and club engineering
            </h3>
            <p className="mt-3 text-ink-muted">
              Screens from the Exiger supplier risk portal and a combined App Dev Club platform
              spanning People Portal, Tech Ops docs, and internal git explore.
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
