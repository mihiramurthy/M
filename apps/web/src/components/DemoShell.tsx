import Link from "next/link";
import { getProject } from "@/content/projects";

export function DemoShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const project = getProject(slug);
  if (!project) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-10 pt-14 md:px-10">
      <Link
        href={`/projects/${slug}`}
        className="text-sm text-ink-muted link-quiet"
      >
        ← {project.name} case study
      </Link>
      <p className="mt-8 section-eyebrow">Live demo</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink md:text-5xl">
        {project.name}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-muted">{project.tagline}</p>
      <div className="mt-10 rounded-showcase border border-black/5 bg-white p-5 shadow-float md:p-8">
        {children}
      </div>
    </div>
  );
}
