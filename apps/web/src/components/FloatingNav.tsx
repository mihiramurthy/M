"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const items = [
  {
    href: "/",
    label: "Home",
    tone: "nav-home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    tone: "nav-about",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 14.5c1.2 1 2.5 1.5 3.5 1.5s2.3-.5 3.5-1.5" strokeLinecap="round" />
        <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/#connect",
    label: "Contact",
    tone: "nav-connect",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S16.9 16 18.5 19" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

function scrollToConnect() {
  document.getElementById("connect")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    if (window.location.hash === "#connect") {
      requestAnimationFrame(() => scrollToConnect());
    }
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/5 bg-white/95 px-2 py-2 shadow-pill backdrop-blur"
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : item.href.startsWith("/#")
              ? false
              : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            onClick={(e) => {
              if (item.href !== "/#connect") return;
              e.preventDefault();
              if (pathname === "/") {
                scrollToConnect();
                window.history.replaceState(null, "", "/#connect");
              } else {
                router.push("/#connect");
              }
            }}
            className={`rounded-full p-3 transition ${item.tone} ${
              active ? "is-active text-white" : "text-ink-muted hover:bg-paper-soft hover:text-ink"
            }`}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
}
