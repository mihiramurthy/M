"use client";

import { useState } from "react";
import { aboutCarousel, aboutHeadshot, type AboutPhoto } from "@/content/aboutPhotos";

function PhotoFrame({
  photo,
  className = "",
  label,
}: {
  photo: AboutPhoto;
  className?: string;
  label?: string;
}) {
  const [ok, setOk] = useState(true);

  return (
    <div className={`relative overflow-hidden bg-[#2c3e3a] ${className}`}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={photo.alt}
          className="h-full w-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between p-5 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            Photo forthcoming
          </p>
          <div>
            <p className="text-lg font-semibold tracking-tight">{label ?? photo.caption}</p>
            <p className="mt-1 text-sm text-white/55">Portrait slot reserved</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AboutHeadshotStack() {
  return (
    <div className="relative mx-auto h-[420px] w-[280px] sm:h-[460px] sm:w-[300px]">
      <div className="absolute left-6 top-8 h-[340px] w-[220px] rotate-[-8deg] rounded-2xl bg-accent-blush shadow-float" />
      <div className="absolute left-10 top-4 h-[340px] w-[220px] rotate-[4deg] rounded-2xl bg-stage-slate shadow-float" />
      <div className="absolute left-0 top-0 h-[360px] w-[240px] overflow-hidden rounded-2xl shadow-card">
        <PhotoFrame photo={aboutHeadshot} className="h-full w-full" label="mihira" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5 pt-16 text-white">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
            College Park
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">mihira</p>
          <p className="mt-1 text-sm text-white/80">CS &amp; Engineering · AI/ML</p>
        </div>
      </div>
      <div className="absolute -left-4 top-10 rounded-2xl bg-white px-3 py-2 text-sm shadow-pill">
        UMD · AI/ML track
      </div>
      <div className="absolute -right-2 bottom-16 rounded-2xl bg-white px-3 py-2 text-sm shadow-pill">
        Open to internships
      </div>
    </div>
  );
}

export function AboutPhotoCarousel() {
  const [index, setIndex] = useState(0);
  const photo = aboutCarousel[index];

  return (
    <section className="mt-16">
      <p className="section-eyebrow section-eyebrow--about">Context</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Selected frames</h2>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Competition placement, campus organizations, and a shipped club demo with an industry
        partner. Light leadership context next to the engineering work.
      </p>

      <div className="mt-8 overflow-hidden rounded-showcase border border-black/5 bg-white shadow-float">
        <div className="aspect-[16/10] w-full">
          <PhotoFrame photo={photo} className="h-full w-full" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="text-sm text-ink-soft">{photo.caption}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i - 1 + aboutCarousel.length) % aboutCarousel.length)}
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm hover:bg-paper-soft"
            >
              Prev
            </button>
            <div className="flex gap-1.5 px-1">
              {aboutCarousel.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Show ${p.caption}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-section-about" : "bg-black/15"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % aboutCarousel.length)}
              className="rounded-full border border-black/10 px-3 py-1.5 text-sm hover:bg-paper-soft"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
