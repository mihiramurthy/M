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
    <div className="pt-24">
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <Link
          href={`/projects/${slug}`}
          className="font-mono text-xs text-mist-400 hover:text-signal"
        >
          ← {project.name} case study
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-ember">
          Live demo
        </p>
        <h1 className="mt-2 font-display text-3xl text-mist-50 md:text-5xl">
          {project.name}
        </h1>
        <p className="mt-3 max-w-2xl text-mist-300">{project.tagline}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
