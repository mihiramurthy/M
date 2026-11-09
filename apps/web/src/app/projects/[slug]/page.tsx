import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyNav } from "@/components/CaseStudyNav";
import { ProjectHeroStage } from "@/components/ProjectMockup";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p?.name ?? "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const nav = project.sections.map((s) => ({ id: s.id, label: s.label }));

  return (
    <article className="mx-auto max-w-6xl px-6 pb-10 pt-12 md:px-10">
      <Link href="/#projects" className="text-sm text-ink-muted link-quiet">
        ← Projects
      </Link>

      <div className="mt-8 grid gap-6 border-b border-black/10 pb-6 text-sm md:grid-cols-3">
        <div>
          <p className="section-eyebrow">Role</p>
          <p className="mt-1 font-medium">{project.role}</p>
        </div>
        <div>
          <p className="section-eyebrow">Type</p>
          <p className="mt-1 font-medium">{project.type}</p>
        </div>
        <div>
          <p className="section-eyebrow">Tools</p>
          <p className="mt-1 font-medium">{project.tools.join(", ")}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={project.demoPath}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live demo
        </Link>
        <a
          href={`https://github.com/mihiramurthy/M/tree/cursor/portfolio-original-demos-52db/${project.repoPath}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium"
        >
          Source
        </a>
      </div>

      <ProjectHeroStage project={project} />

      <div className="mt-16 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
        <CaseStudyNav sections={nav} />
        <div className="max-w-2xl space-y-20">
          {project.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <p className="section-eyebrow">{section.eyebrow ?? section.label}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft">
                {section.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {section.insight && (
                <div className="insight-card mt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink">
                    {section.insight.title}
                  </p>
                  <ul className="mt-4 space-y-3 text-ink-soft">
                    {section.insight.points.map((pt) => (
                      <li key={pt.lead}>
                        <span className="font-semibold text-ink">{pt.lead}</span> {pt.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          <section id="run" className="scroll-mt-24 rounded-2xl border border-black/5 bg-white p-6 shadow-float">
            <p className="section-eyebrow">Run locally</p>
            <pre className="mt-4 overflow-x-auto font-mono text-xs text-ink-soft">
              {project.run.join("\n")}
            </pre>
            <p className="mt-4 text-sm text-ink-muted">
              Or open the{" "}
              <Link href={project.demoPath} className="font-medium text-accent">
                live demo
              </Link>{" "}
              on this site.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
