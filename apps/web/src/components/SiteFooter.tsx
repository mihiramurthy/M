import { profile } from "@/content/experience";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-mist-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs">
          Built as original demos · not employer IP ·{" "}
          <a className="text-signal hover:underline" href="https://github.com/mihiramurthy/M">
            github.com/mihiramurthy/M
          </a>
        </p>
      </div>
    </footer>
  );
}
