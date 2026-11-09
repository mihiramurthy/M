import type { Project } from "@/content/projects";

const stageBg: Record<Project["stage"], string> = {
  pine: "bg-stage-pine",
  inkblue: "bg-stage-inkblue",
  slate: "bg-stage-slate",
  olive: "bg-stage-olive",
  cocoa: "bg-stage-cocoa",
  graphite: "bg-stage-graphite",
};

function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[148px] shrink-0 overflow-hidden rounded-[1.35rem] border-[5px] border-black/80 bg-white shadow-card sm:w-[168px] ${className}`}
    >
      <div className="absolute left-1/2 top-1.5 z-10 h-3 w-16 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="aspect-[9/17] overflow-hidden bg-[#f7f7f5] pt-5">{children}</div>
    </div>
  );
}

function Laptop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[220px] shrink-0 sm:w-[260px]">
      <div className="overflow-hidden rounded-xl border-[5px] border-black/75 bg-white shadow-card">
        <div className="flex h-5 items-center gap-1 bg-black/80 px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
        <div className="aspect-[16/10] bg-[#f3f3ef]">{children}</div>
      </div>
      <div className="mx-auto h-2 w-[92%] rounded-b-md bg-black/70" />
    </div>
  );
}

function CareAtlasUI() {
  return (
    <div className="space-y-2 p-3 text-[9px] text-ink">
      <p className="font-semibold">Matches near 20740</p>
      {[
        ["Paint Branch CHC", "92"],
        ["Riverdale Sliding", "88"],
        ["Hyattsville Hub", "81"],
      ].map(([n, s]) => (
        <div key={n} className="rounded-lg bg-white p-2 shadow-sm">
          <div className="flex justify-between font-medium">
            <span>{n}</span>
            <span className="text-emerald-700">{s}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-black/5">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${s}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ClaimTrailUI() {
  return (
    <div className="space-y-2 p-3 text-[9px]">
      <p className="font-semibold text-ink">Trust report</p>
      <div className="rounded-lg bg-white p-3 shadow-sm">
        <p className="text-2xl font-bold text-orange-600">38</p>
        <p className="text-ink-muted">elevated-caution</p>
      </div>
      <div className="space-y-1 font-mono text-[8px] text-ink-muted">
        <p>worker.archive.done</p>
        <p>worker.domain.done</p>
        <p>worker.agreement.done</p>
      </div>
    </div>
  );
}

function AquiferUI() {
  return (
    <div className="grid h-full grid-cols-2 gap-1 p-2">
      {["#7eb8c9", "#3a7a8a", "#d9896c", "#2f6f66", "#c4b27a", "#4d6b8a"].map((c, i) => (
        <div key={c} className="rounded-md" style={{ background: c, opacity: 0.85 + i * 0.02 }}>
          <div className="p-1.5 text-[8px] font-medium text-white/90">site {i + 1}</div>
        </div>
      ))}
    </div>
  );
}

function WattlineUI() {
  return (
    <div className="flex h-full flex-col justify-end gap-1 p-3">
      <svg viewBox="0 0 120 48" className="w-full text-lime-600">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points="0,30 15,28 30,18 45,22 60,10 75,14 90,8 105,16 120,12"
        />
      </svg>
      <p className="text-[9px] font-semibold text-ink">3.86 kg CO₂e saved</p>
      <p className="text-[8px] text-ink-muted">vs evening-naive schedule</p>
    </div>
  );
}

function LoanUI() {
  return (
    <div className="space-y-2 p-3 text-[9px]">
      {["Standard", "IDR", "Forbearance"].map((n, i) => (
        <div key={n} className="rounded-lg bg-white p-2 shadow-sm">
          <p className="font-semibold text-ink">{n}</p>
          <p className="text-ink-muted">${[48200, 39100, 52100][i].toLocaleString()} total</p>
        </div>
      ))}
    </div>
  );
}

function TokenLensUI() {
  return (
    <div className="flex h-full flex-col gap-2 p-3 text-[9px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">TokenLens</span>
        <span className="rounded-full bg-emerald-100 px-1.5 text-[8px] text-emerald-700">live</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["$1.2k", "0.81q", "14↓"].map((v) => (
          <div key={v} className="rounded-md bg-white p-1.5 text-center font-mono text-[8px] shadow-sm">
            {v}
          </div>
        ))}
      </div>
      <div className="rounded-md bg-white p-2 shadow-sm">
        <p className="font-medium text-ink">gpt-4o → gpt-4o-mini</p>
        <p className="text-ink-muted">trivial · quality 0.88 · save $0.04</p>
        <div className="mt-1 h-1.5 rounded-full bg-black/5">
          <div className="h-full w-2/3 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="rounded-md bg-[#0b1220] p-2 font-mono text-[8px] text-emerald-300">
        POST /v1/chat/completions
      </div>
    </div>
  );
}

function ProofDebuggerUI() {
  return (
    <div className="flex h-full flex-col gap-2 p-3 text-[9px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">⊢ Proof Debugger</span>
        <span className="rounded-full bg-amber-100 px-1.5 text-[8px] text-amber-800">ocaml</span>
      </div>
      <div className="rounded-md bg-white p-2 font-mono text-[8px] leading-relaxed shadow-sm">
        P1: P [Premise]
        <br />
        P2: P→Q [Premise]
        <br />
        S3: P [MP P1 P2]
      </div>
      <div className="rounded-md bg-[#fff6f5] p-2 text-[8px] text-red-800 shadow-sm">
        ✗ S3 modus_ponens_misapply
        <br />
        need Q, not P
      </div>
      <div className="rounded-md bg-white p-2 text-[8px] shadow-sm">
        TA cluster: MP misapply × 14
      </div>
    </div>
  );
}

const ui: Record<string, React.ReactNode> = {
  "proof-debugger": <ProofDebuggerUI />,
  "token-lens": <TokenLensUI />,
  "care-atlas": <CareAtlasUI />,
  "claim-trail": <ClaimTrailUI />,
  "aquifer-net": <AquiferUI />,
  wattline: <WattlineUI />,
  "loan-lattice": <LoanUI />,
};

export function ProjectShowcaseCard({
  project,
  href,
}: {
  project: Project;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-showcase p-6 text-white shadow-float transition hover:-translate-y-1 hover:shadow-card md:min-h-[380px] md:p-8 ${stageBg[project.stage]}`}
    >
      <div className="relative z-10 max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
          {project.tags.join(" · ")}
        </p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
          Meet {project.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
          {project.short}
        </p>
        <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink transition group-hover:bg-accent group-hover:text-white">
          View case study
        </span>
      </div>

      <div className="pointer-events-none absolute -bottom-6 -right-2 flex items-end gap-3 opacity-95 transition duration-500 group-hover:-translate-y-2 md:right-6">
        {project.slug === "wattline" ||
        project.slug === "aquifer-net" ||
        project.slug === "token-lens" ||
        project.slug === "proof-debugger" ? (
          <Laptop>{ui[project.slug]}</Laptop>
        ) : (
          <>
            <Phone className="translate-y-4 rotate-[-6deg]">{ui[project.slug]}</Phone>
            {(project.slug === "care-atlas" || project.slug === "loan-lattice") && (
              <Laptop>{ui[project.slug]}</Laptop>
            )}
          </>
        )}
      </div>
    </a>
  );
}

export function ProjectHeroStage({ project }: { project: Project }) {
  return (
    <div
      className={`relative mt-10 overflow-hidden rounded-showcase px-6 py-10 text-white md:px-12 md:py-14 ${stageBg[project.stage]}`}
    >
      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
            {project.name}
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight md:text-4xl">
            {project.tagline}
          </h2>
          <p className="mt-4 max-w-md text-white/70">{project.short}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={project.demoPath}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live demo
            </a>
            <a
              href="/Mihira_Murthy_Resume.pdf"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white"
            >
              Resume
            </a>
          </div>
        </div>
        <div className="flex items-end justify-center gap-4 md:justify-end">
          <Phone className="rotate-[-8deg]">{ui[project.slug]}</Phone>
          <Laptop>{ui[project.slug]}</Laptop>
        </div>
      </div>
    </div>
  );
}
