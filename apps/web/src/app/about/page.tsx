import Link from "next/link";
import {
  activities,
  awards,
  experience,
  profile,
  resumeProject,
  skills,
} from "@/content/experience";

function FrameStack() {
  return (
    <div className="relative mx-auto h-[420px] w-[280px] sm:h-[460px] sm:w-[300px]">
      <div className="absolute left-6 top-8 h-[340px] w-[220px] rotate-[-8deg] rounded-2xl bg-accent-blush shadow-float" />
      <div className="absolute left-10 top-4 h-[340px] w-[220px] rotate-[4deg] rounded-2xl bg-stage-slate shadow-float" />
      <div className="absolute left-0 top-0 h-[360px] w-[240px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c3e3a] via-[#3d4f48] to-[#1a2623] shadow-card">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-8 top-16 h-28 w-28 rounded-full bg-accent/40 blur-2xl" />
          <div className="absolute bottom-10 right-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative flex h-full flex-col justify-between p-6 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            College Park
          </p>
          <div>
            <p className="text-4xl font-bold tracking-tight">MM</p>
            <p className="mt-2 text-sm text-white/75">CS &amp; Engineering · AI/ML</p>
          </div>
        </div>
      </div>
      <div className="absolute -left-4 top-10 rounded-2xl bg-white px-3 py-2 text-sm shadow-pill">
        hey there! 👋
      </div>
      <div className="absolute -right-2 bottom-16 rounded-2xl bg-white px-3 py-2 text-sm shadow-pill">
        thx for stopping by :)
      </div>
    </div>
  );
}

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-14 md:px-10">
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <FrameStack />
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Hi, I&apos;m Mihira!
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            📍 College Park, MD · 🎓 {profile.school.degree}
          </p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
            <p>
              I&apos;m a CS &amp; Engineering student on the AI/ML track at UMD. I like building
              tools where the decision path is{" "}
              <span className="font-semibold text-accent">inspectable</span> — matchers you can
              audit, pipelines with event logs, models with contribution lists.
            </p>
            <p>
              Outside class I&apos;ve led App Dev Club project work, researched interpretable ML,
              and shipped security-side LLM prototypes. This site showcases original personal
              demos — not rebuilds of internship IP.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/Mihira_Murthy_Resume.pdf"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Download resume
            </Link>
            <Link
              href="/#projects"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium"
            >
              See projects
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <p className="section-eyebrow">Experience</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Roles &amp; research</h2>
        <ol className="mt-10 space-y-10">
          {experience.map((job) => (
            <li key={job.role + job.dates} className="grid gap-3 md:grid-cols-[200px_1fr]">
              <div>
                <p className="font-mono text-xs text-ink-muted">{job.dates}</p>
                <p className="mt-1 text-sm text-accent">{job.org}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{job.role}</h3>
                <ul className="mt-3 space-y-2 text-ink-soft">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl bg-paper-soft p-6">
          <h3 className="text-lg font-semibold">{resumeProject.name}</h3>
          <p className="mt-1 font-mono text-xs text-ink-muted">{resumeProject.tech}</p>
          <ul className="mt-3 space-y-2 text-ink-soft">
            {resumeProject.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">
            Club contribution listed for accuracy — not rebuilt as a portfolio demo.
          </p>
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <p className="section-eyebrow">Skills</p>
          <div className="mt-4 space-y-5">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
                  {group}
                </h3>
                <p className="mt-2 text-ink-soft">{items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <p className="section-eyebrow">Activities</p>
            <p className="mt-3 text-ink-soft">{activities.join(" · ")}</p>
          </div>
          <div>
            <p className="section-eyebrow">Awards</p>
            <p className="mt-3 text-ink-soft">{awards.join(" · ")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
