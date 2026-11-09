"use client";

import { useEffect, useState } from "react";

export function CaseStudyNav({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.4, 0.7] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sticky top-10 hidden self-start lg:block" aria-label="Case study">
      <ul className="space-y-4">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                active === s.id ? "text-ink" : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  active === s.id ? "bg-accent" : "bg-transparent"
                }`}
              />
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
