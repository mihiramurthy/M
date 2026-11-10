import { currentWork } from "@/content/currentWork";

export function CurrentWorkCard() {
  const work = currentWork;

  return (
    <section id="current" className="mx-auto max-w-6xl px-6 pb-4 pt-4 md:px-10">
      <div className="overflow-hidden rounded-showcase border border-black/5 bg-white shadow-float">
        <div className="bg-stage-inkblue px-6 py-5 text-white md:px-8 md:py-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            {work.title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{work.name}</h2>
          <p className="mt-2 text-sm text-white/75">
            {work.role} · {work.partner} with {work.org}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
            {work.dates}
          </p>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div>
            <p className="text-sm leading-relaxed text-ink-soft">{work.summary}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-muted">
              {work.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap content-start gap-2">
            {work.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/10 bg-paper-soft px-3 py-1 text-xs font-medium text-ink-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
