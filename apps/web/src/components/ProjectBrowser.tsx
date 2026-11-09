"use client";

import { useState } from "react";
import Link from "next/link";
import { featuredProjects } from "@/content/projects";
import { ProjectShowcaseCard } from "@/components/ProjectMockup";

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
        <div className="rounded-showcase border border-dashed border-black/15 bg-white px-6 py-14 text-center shadow-float">
          <p className="section-eyebrow">Past work</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Private / employer screenshots coming soon
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            This tab is reserved for internship and club case-study uploads. Until those
            files land, shipped personal work lives under Projects.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            See experience on About
          </Link>
        </div>
      )}
    </section>
  );
}
