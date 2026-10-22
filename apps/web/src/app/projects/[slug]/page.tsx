import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const p = getProject(slug);
    return { title: p?.name ?? "Project" };
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="pt-24">
      <div className="border-b border-white/5 bg-atlas-mesh noise">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <Link href="/#projects" className="font-mono text-xs text-mist-400 hover:text-signal">
            ← Projects
          </Link>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-ember">
            {project.tags.join(" · ")}
          </p>
          <h1 className="mt-3 font-display text-4xl text-mist-50 md:text-6xl">
            {project.name}
          </h1>
          <p className="mt-4 text-xl text-mist-300">{project.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={project.demoPath}
              className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-ink-950"
            >
              Open live demo
            </Link>
            <a
              href={`https://github.com/mihiramurthy/M/tree/cursor/portfolio-original-demos-52db/${project.repoPath}`}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-mist-100"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-16 md:px-8">
        <section>
          <h2 className="font-display text-2xl text-mist-50">Problem</h2>
          <p className="mt-3 text-mist-300 leading-relaxed">{project.problem}</p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-mist-50">Approach</h2>
          <p className="mt-3 text-mist-300 leading-relaxed">{project.approach}</p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-mist-50">Architecture</h2>
          <ul className="mt-3 space-y-2 text-mist-300">
            {project.architecture.map((a) => (
              <li key={a} className="flex gap-3">
                <span className="text-signal">▹</span>
                {a}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl text-mist-50">Highlights</h2>
          <ul className="mt-3 space-y-2 text-mist-300">
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl text-mist-50">Tech</h2>
          <p className="mt-3 font-mono text-sm text-signal">{project.tech.join(" · ")}</p>
        </section>
        <section className="rounded-xl border border-white/10 bg-ink-800/50 p-6">
          <h2 className="font-display text-xl text-mist-50">Run locally</h2>
          <pre className="mt-4 overflow-x-auto font-mono text-xs text-mist-300">
            {project.run.join("\n")}
          </pre>
        </section>
      </div>
    </article>
  );
}
