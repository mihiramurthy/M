import Link from "next/link";

const links = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-tight text-mist-50 link-underline"
        >
          Mihira Murthy
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-mist-300 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-mist-50 link-underline">
              {l.label}
            </Link>
          ))}
          <a
            href="/Mihira_Murthy_Resume.pdf"
            className="rounded-md bg-signal px-3 py-1.5 font-medium text-ink-950 transition hover:bg-signal-bright"
          >
            Resume
          </a>
        </nav>
        <a
          href="/Mihira_Murthy_Resume.pdf"
          className="rounded-md bg-signal px-3 py-1.5 text-sm font-medium text-ink-950 md:hidden"
        >
          Resume
        </a>
      </div>
    </header>
  );
}
