import Link from "next/link";
import { LetterBlockName } from "@/components/LetterBlockName";
import { ProjectBrowser } from "@/components/ProjectBrowser";
import { profile } from "@/content/experience";

export default function HomePage() {
  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pb-4 pt-10 md:px-10 md:pt-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <LetterBlockName />
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">UMD</span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">AI / ML</span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">App Dev Club</span>
            <Link
              href="/Mihira_Murthy_Resume.pdf"
              className="rounded-full bg-ink px-3 py-1 font-medium text-white"
            >
              Resume
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <h1 className="animate-fade-up text-[clamp(2.8rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
              software
              <br />
              engineer
            </h1>
            <p className="animate-fade-up-delay mt-5 max-w-md text-lg text-ink-soft">
              Building systems that make complex decisions{" "}
              <span className="font-semibold text-accent">legible</span> — for care access,
              provenance, groundwater risk, grids, and student debt.
            </p>
          </div>
          <div className="animate-fade-up-late space-y-3 text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-muted md:pb-2">
            <p>Thinks in systems, ships explainable tools, cares about the details.</p>
            <p>
              Recently: original demos across fullstack · backend · ml · frontend
            </p>
            <p>Currently: looking for internships that ship real software.</p>
            <p className="pt-2 normal-case tracking-normal text-ink-soft">
              {profile.school.name} · {profile.school.dates}
            </p>
          </div>
        </div>
      </header>

      <ProjectBrowser />

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="rounded-showcase border border-black/5 bg-white p-8 shadow-float md:p-10">
          <p className="section-eyebrow">Internship case studies</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Slot reserved for upcoming writeups
          </h2>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Detailed artifacts from internship work will land here once files are uploaded.
            Until then, experience lives on the About page — demos above stay personal and
            original.
          </p>
        </div>
      </section>
    </>
  );
}
