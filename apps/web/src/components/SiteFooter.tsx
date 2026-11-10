import { profile } from "@/content/experience";

export function SiteFooter() {
  return (
    <footer id="connect" className="connect-shell border-t border-black/5 pb-28 pt-16">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <p className="section-eyebrow section-eyebrow--connect">Contact</p>
        <h2 className="mt-3 font-sans text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Let&apos;s connect
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-base text-ink-soft">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="link-quiet font-medium"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="link-quiet inline-flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <span className="sr-only md:not-sr-only md:inline">{profile.email}</span>
          </a>
          <a href="/Mihira_Murthy_Resume.pdf" className="link-quiet font-medium">
            Resume
          </a>
        </div>
        <div className="mt-14 flex flex-col gap-2 text-sm text-ink-muted md:flex-row md:items-end md:justify-between">
          <p>
            College Park, MD · Built with Next.js
          </p>
          <p>© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </div>
    </footer>
  );
}
