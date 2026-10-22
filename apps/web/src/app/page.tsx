import Link from "next/link";
import { ProjectFilters } from "@/components/ProjectFilters";
import {
  activities,
  awards,
  experience,
  profile,
  resumeProject,
  skills,
} from "@/content/experience";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden bg-atlas-mesh noise">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,#070b0a)]" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
          <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.22em] text-signal">
            University of Maryland · AI/ML
          </p>
          <h1 className="animate-fade-up-delay mt-4 font-display text-[clamp(3.2rem,10vw,6.5rem)] leading-[0.92] tracking-tight text-mist-50">
            Mihira
            <br />
            Murthy
          </h1>
          <p className="animate-fade-up-late mt-6 max-w-xl text-lg text-mist-300 md:text-xl">
            {profile.headline}. {profile.supporting}
          </p>
          <div className="animate-fade-up-late mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-signal-bright"
            >
              View projects
            </a>
            <a
              href="/Mihira_Murthy_Resume.pdf"
              className="rounded-md border border-white/15 px-5 py-2.5 text-sm text-mist-100 hover:border-signal/50"
            >
              Download resume
            </a>
            <a
              href="#contact"
              className="rounded-md border border-white/15 px-5 py-2.5 text-sm text-mist-100 hover:border-signal/50"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">About</p>
        <div className="mt-4 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <h2 className="font-display text-3xl leading-snug text-mist-50 md:text-4xl">
            I care about systems people can audit — matching engines, provenance
            pipelines, risk models, and planners with the math in the open.
          </h2>
          <div className="space-y-4 text-mist-300">
            <p>
              {profile.school.degree} at {profile.school.name} ({profile.school.dates}).
              Experience spans AI DevOps, research on interpretable ML, security-side
              LLM prototypes, and supplier-risk product work.
            </p>
            <p>
              The demos below are <strong className="text-mist-100">original personal projects</strong>{" "}
              aimed at timely problems — not rebuilds of internship or club IP.
            </p>
          </div>
        </div>
      </section>

      <section id="projects" className="border-y border-white/5 bg-ink-900/50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">Projects</p>
          <h2 className="mt-3 font-display text-3xl text-mist-50 md:text-4xl">
            Original work across the stack
          </h2>
          <p className="mt-3 max-w-2xl text-mist-300">
            Each project has runnable source under <code className="text-signal">projects/</code>{" "}
            and a live interactive demo on this site.
          </p>
          <div className="mt-10">
            <ProjectFilters />
          </div>
        </div>
      </section>

      <section id="internship" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
          Upcoming internship case studies
        </p>
        <h2 className="mt-3 font-display text-3xl text-mist-50">Slot reserved</h2>
        <p className="mt-3 max-w-2xl text-mist-300">
          Detailed writeups and artifacts from internship work will land here once
          files are uploaded. Until then, see Experience for role summaries — demos
          above remain personal/original only.
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-ink-800/40 px-6 py-10 text-mist-400">
          Waiting on internship materials · structure ready for case-study pages
        </div>
      </section>

      <section id="experience" className="border-y border-white/5 bg-ink-900/40 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">Experience</p>
          <h2 className="mt-3 font-display text-3xl text-mist-50 md:text-4xl">Roles & research</h2>
          <ol className="mt-12 space-y-12">
            {experience.map((job) => (
              <li key={job.role + job.dates} className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="font-mono text-xs text-mist-400">{job.dates}</p>
                  <p className="mt-1 text-sm text-signal">{job.org}</p>
                </div>
                <div>
                  <h3 className="font-display text-xl text-mist-50">{job.role}</h3>
                  <ul className="mt-3 space-y-2 text-mist-300">
                    {job.bullets.map((b) => (
                      <li key={b} className="pl-4 relative before:absolute before:left-0 before:content-['–']">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-16 border-t border-white/10 pt-10">
            <h3 className="font-display text-xl text-mist-50">{resumeProject.name}</h3>
            <p className="mt-1 font-mono text-xs text-mist-400">{resumeProject.tech}</p>
            <ul className="mt-4 max-w-3xl space-y-2 text-mist-300">
              {resumeProject.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-mist-400">
              Club platform contribution — listed for accuracy; not rebuilt as a portfolio demo.
            </p>
          </div>
        </div>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">Skills</p>
        <h2 className="mt-3 font-display text-3xl text-mist-50">Toolkit</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-signal">
                {group}
              </h3>
              <p className="mt-3 text-mist-300">{items.join(" · ")}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ember">
              Activities
            </h3>
            <p className="mt-3 text-mist-300">{activities.join(" · ")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ember">
              Awards
            </h3>
            <p className="mt-3 text-mist-300">{awards.join(" · ")}</p>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/5 bg-atlas-mesh py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember">Contact</p>
          <h2 className="mt-3 font-display text-3xl text-mist-50 md:text-5xl">
            Let&apos;s talk internships & building.
          </h2>
          <div className="mt-8 flex flex-wrap gap-4 text-lg">
            <a className="text-signal link-underline" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <span className="text-mist-400">·</span>
            <a className="text-signal link-underline" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <span className="text-mist-400">·</span>
            <a className="text-signal link-underline" href="tel:+16692610364">
              {profile.phone}
            </a>
          </div>
          <Link
            href="/Mihira_Murthy_Resume.pdf"
            className="mt-8 inline-block rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-ink-950"
          >
            Download resume (PDF)
          </Link>
        </div>
      </section>
    </>
  );
}
