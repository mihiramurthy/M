"use client";

import { useEffect, useState } from "react";
import type { PastWorkSlide } from "@/content/pastWork";

export function PastWorkCarousel({
  slides,
  autoMs = 4200,
}: {
  slides: PastWorkSlide[];
  autoMs?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const slide = slides[i] ?? slides[0];

  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), autoMs);
    return () => clearInterval(t);
  }, [n, paused, autoMs]);

  if (!slide) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#1a1a1a] shadow-card">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-[#2a2a2a] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate font-mono text-[10px] text-white/45">
            {slide.caption || "screenshot"}
          </span>
        </div>
        <div className="relative aspect-[16/10] bg-[#0f0f0f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className="h-full w-full object-contain object-top animate-fade-up"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm text-ink-muted">
          <span className="font-mono text-[11px] text-ink-faint">
            {i + 1}/{n}
          </span>{" "}
          {slide.caption}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-paper-soft"
            onClick={() => setI((x) => (x - 1 + n) % n)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-paper-soft"
            onClick={() => setI((x) => (x + 1) % n)}
          >
            →
          </button>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition ${
                idx === i ? "w-6 bg-ink" : "w-1.5 bg-black/20 hover:bg-black/35"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
