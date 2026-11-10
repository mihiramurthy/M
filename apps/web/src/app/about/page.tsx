import Link from "next/link";
import {
  activities,
  awards,
  experience,
  profile,
  resumeProject,
  skills,
} from "@/content/experience";
import { AboutHeadshotStack, AboutPhotoCarousel } from "@/components/AboutPhotoSlots";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="about-shell mx-auto max-w-6xl px-6 pb-10 pt-14 md:px-10">
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <AboutHeadshotStack />
        <div>
          <p className="section-eyebrow section-eyebrow--about">About</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Mihira Murthy
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            College Park, MD · {profile.school.degree}
          </p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
            <p>
              CS &amp; Engineering student on the AI/ML track at UMD. I work on systems where
              ranking, routing, and risk stay auditable: matchers you can inspect, pipelines with
              event logs, and models with readable contribution lists.
            </p>
            <p>
              Outside coursework I lead App Dev Club engineering work, research interpretable ML,
              and prototype LLM tools for security triage. This site pairs personal demos you can
              run with selected internship and club interface screenshots.
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

      <AboutPhotoCarousel />

      <section className="mt-24">
        <p className="section-eyebrow section-eyebrow--about">Experience</p>
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
        </div>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <p className="section-eyebrow section-eyebrow--about">Skills</p>
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
            <p className="section-eyebrow section-eyebrow--about">Activities</p>
            <p className="mt-3 text-ink-soft">{activities.join(" · ")}</p>
          </div>
          <div>
            <p className="section-eyebrow section-eyebrow--about">Awards</p>
            <p className="mt-3 text-ink-soft">{awards.join(" · ")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
