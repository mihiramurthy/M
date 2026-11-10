import Link from "next/link";
import { activities, awards, profile, skills } from "@/content/experience";
import { AboutHeadshotStack, AboutPhotoCarousel } from "@/components/AboutPhotoSlots";
import { currentWork } from "@/content/currentWork";

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
              UMD CS and Engineering student on the AI/ML track. I specialize in software
              development and applied AI, and I have led technical projects that connect engineering
              work to product goals and user needs. Day to day that means programming, system
              design, and careful analysis, plus the coordination it takes to ship with a team.
            </p>
            <p>
              Recent work spans App Dev Club engineering and partner delivery on Exiger and Booz
              Allen engagements. I care about intelligent tools that stay understandable, and about
              growing through real collaboration rather than solo demos alone.
            </p>
            <div className="rounded-2xl bg-paper-soft px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Core competencies
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Software engineering · Artificial intelligence · Product management · Data analysis
                · System design · Project coordination · UX collaboration · Technical documentation
                · Agile development · Cross functional leadership
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/#current"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            >
              Current work
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

      <section className="mt-16 rounded-showcase border border-black/5 bg-paper-soft p-6 md:p-8">
        <p className="section-eyebrow section-eyebrow--about">{currentWork.title}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          {currentWork.name}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {currentWork.role} · {currentWork.partner} with {currentWork.org} · {currentWork.dates}
        </p>
        <p className="mt-4 max-w-3xl text-ink-soft">{currentWork.summary}</p>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-2">
        <div>
          <p className="section-eyebrow section-eyebrow--about">Skills</p>
          <div className="mt-4 space-y-5">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink">
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
