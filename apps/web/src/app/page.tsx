import Link from "next/link";
import { LetterBlockName } from "@/components/LetterBlockName";
import { ProjectBrowser } from "@/components/ProjectBrowser";
import { CurrentWorkCard } from "@/components/CurrentWorkCard";
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
            <p className="animate-fade-up-delay mt-5 max-w-xl text-lg text-ink-soft">
              UMD computer science student focused on software engineering and artificial
              intelligence, with enough product sense to scope work, talk to stakeholders, and
              ship. I write systems and models you can inspect, from APIs and schedulers to trained
              classifiers with metrics on the page.
            </p>
          </div>
          <div className="animate-fade-up-late space-y-3 text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ink-muted md:pb-2">
            <p>Software engineering · AI/ML · light PM</p>
            <p>System design · data analysis · agile delivery</p>
            <p>UX collaboration · technical docs · team lead</p>
            <p>Open to software engineering internships</p>
            <p className="pt-2 normal-case tracking-normal text-ink-soft">
              {profile.school.name} · {profile.school.dates}
            </p>
          </div>
        </div>
      </header>

      <CurrentWorkCard />
      <ProjectBrowser />
    </>
  );
}
