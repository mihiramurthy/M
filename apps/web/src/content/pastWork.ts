/** Private / employer & club screenshot case studies.
 * Add new projects by appending to `pastWorkProjects` and dropping webps under
 * `public/past-work/<slug>/`. Slides are screenshot-proof only — no source links.
 */

export type PastWorkSlide = {
  src: string;
  alt: string;
  caption?: string;
};

export type PastWorkProject = {
  slug: string;
  name: string;
  org: string;
  role: string;
  dates: string;
  summary: string;
  bullets: string[];
  tags: string[];
  stage: "slate" | "olive" | "graphite" | "pine" | "cocoa";
  slides: PastWorkSlide[];
};

function slides(
  slug: string,
  items: { file: string; caption: string; alt?: string }[]
): PastWorkSlide[] {
  return items.map((s) => ({
    src: `/past-work/${slug}/${s.file}`,
    caption: s.caption,
    alt: s.alt ?? `${slug} — ${s.caption}`,
  }));
}

export const pastWorkProjects: PastWorkProject[] = [
  {
    slug: "exiger-supplier-portal",
    name: "Exiger Supplier Portal",
    org: "UMD App Dev Club × Exiger",
    role: "Frontend Engineer & PM",
    dates: "Aug 2025 – May 2026",
    summary:
      "Supplier risk management portal for AI-powered TPRM — Product Catalog, Orders, Work, and Messaging with searchable color-coded risk scores. Screenshot proof only; no source links.",
    bullets: [
      "Developed a supplier risk management portal for AI-powered TPRM from purchase orders, payment/credit history, and compliance posture.",
      "Led schema/system design for Okta-backed 2FA and company-scoped registration across frontend and backend.",
      "Shipped Product Catalog, Orders, Work, and Messaging with searchable color-coded risk scores and in-app messaging.",
    ],
    tags: ["frontend", "PM", "TPRM"],
    stage: "olive",
    slides: slides("exiger-supplier-portal", [
      { file: "slide-01.webp", caption: "Settings — my account" },
      { file: "slide-02.webp", caption: "Manage — documents" },
      { file: "slide-03.webp", caption: "Product catalog — part detail & risk" },
      { file: "slide-04.webp", caption: "Orders / risk detail" },
      { file: "slide-05.webp", caption: "Work overview" },
      { file: "slide-06.webp", caption: "Messaging entry" },
      { file: "slide-07.webp", caption: "Product catalog list" },
      { file: "slide-08.webp", caption: "Catalog search & hierarchy" },
      { file: "slide-09.webp", caption: "Manage — supplier overview" },
      { file: "slide-10.webp", caption: "Work — overview tasks" },
      { file: "slide-11.webp", caption: "Questionnaire / work flow" },
      { file: "slide-12.webp", caption: "Task filters" },
      { file: "slide-13.webp", caption: "Risk analysis" },
      { file: "slide-14.webp", caption: "Task detail + questionnaire" },
      { file: "slide-15.webp", caption: "Work board" },
      { file: "slide-16.webp", caption: "In-app messaging" },
      { file: "slide-17.webp", caption: "Orders list" },
      { file: "slide-18.webp", caption: "Dashboard / activity" },
      { file: "slide-19.webp", caption: "Tasks board with filters" },
      { file: "slide-20.webp", caption: "Catalog — filtered product view" },
      { file: "slide-21.webp", caption: "Settings — workspace members" },
      { file: "slide-22.webp", caption: "Settings — account & members nav" },
    ]),
  },
  {
    slug: "rtx-url-profiling",
    name: "URL → supplier capability profile",
    org: "Nokia internship — Product Security PoC",
    role: "AI Solution Engineering Intern",
    dates: "May 2026 – Aug 2026",
    summary:
      "Screenshot proof of an AI-assisted profiling PoC: start from a public company URL, scrape a small page budget, and emit structured capability / legal-identity sections. Demo input shown is a public corporate site — not a claim about shipping RTX product IP.",
    bullets: [
      "Designed AI/ML proofs of concept for Product Security as independent microservices with architecture partners.",
      "Built tooling that turns a start URL into structured supplier / capability profile sections for review.",
    ],
    tags: ["AI/ML", "PoC", "Product Security"],
    stage: "graphite",
    slides: slides("rtx-url-profiling", [
      { file: "slide-01.webp", caption: "Capability profile from URL" },
      { file: "slide-02.webp", caption: "Legal identity & structure" },
      { file: "slide-03.webp", caption: "Generation config — start URL" },
      { file: "slide-04.webp", caption: "Corporate structure mapping" },
    ]),
  },
  {
    slug: "adc-people-portal",
    name: "ADC People Portal",
    org: "UMD App Dev Club",
    role: "Fullstack contributor",
    dates: "Club platform",
    summary:
      "Internal platform for recruitment, onboarding, and team ops — teams, meetings, events, settings, and IAM sign-in. Screenshot proof only.",
    bullets: [
      "Contributed fullstack to an internal platform used by 700+ App Dev Club members for recruitment, onboarding, and team ops.",
      "Built recruitment/ATS features: role posting, Kanban pipeline, collaborative review.",
      "Integrated GitHub and Slack for source control access and automated onboarding communication.",
    ],
    tags: ["fullstack", "IAM", "ops"],
    stage: "slate",
    slides: slides("adc-people-portal", [
      { file: "slide-01.webp", caption: "Team detail — members & resources" },
      { file: "slide-02.webp", caption: "Teams list" },
      { file: "slide-03.webp", caption: "Events — RSVP & attendance" },
      { file: "slide-04.webp", caption: "Sign-in — App Dev IAM / OpenID" },
      { file: "slide-05.webp", caption: "Team meetings calendar" },
      { file: "slide-06.webp", caption: "Team settings — AWS provision" },
    ]),
  },
  {
    slug: "adc-wiki",
    name: "ADC Wiki & Tech Ops docs",
    org: "UMD App Dev Club",
    role: "Docs / tech ops",
    dates: "Club platform",
    summary:
      "Internal documentation for People Portal user & developer guides — team hierarchy, creation flows, and ops notes. Screenshot proof of the docs surface.",
    bullets: [
      "People Portal user guide covering team hierarchy (main teams / subteams).",
      "Developer-facing docs for auth, shared resources, and contribution guidelines.",
    ],
    tags: ["docs", "tech ops"],
    stage: "pine",
    slides: slides("adc-wiki", [
      { file: "slide-01.webp", caption: "Understanding teams" },
      { file: "slide-02.webp", caption: "Subteams structure" },
      { file: "slide-03.webp", caption: "Team creation guide" },
      { file: "slide-04.webp", caption: "People Portal introduction" },
    ]),
  },
  {
    slug: "adc-git-explore",
    name: "Internal git explore",
    org: "UMD App Dev Club",
    role: "Platform surface",
    dates: "Club platform",
    summary:
      "Explore view across partner-org repositories (IonQ, Kuiper, and other club project orgs). Screenshot proof only — no repo access claims beyond the UI shown.",
    bullets: [
      "Browse repositories, users, and organizations from a unified explore UI.",
      "Surfaces partner project repos used across App Dev Club engagements.",
    ],
    tags: ["git", "explore"],
    stage: "cocoa",
    slides: slides("adc-git-explore", [
      { file: "slide-01.webp", caption: "Explore repos across partner orgs" },
    ]),
  },
];

export function getPastWork(slug: string) {
  return pastWorkProjects.find((p) => p.slug === slug);
}
