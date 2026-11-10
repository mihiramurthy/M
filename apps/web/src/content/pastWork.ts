/** Internship and club screenshot case studies. */

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
    alt: s.alt ?? `${slug} ${s.caption}`,
  }));
}

export const pastWorkProjects: PastWorkProject[] = [
  {
    slug: "exiger-supplier-portal",
    name: "Exiger Supplier Portal",
    org: "UMD App Dev Club with Exiger",
    role: "Frontend Engineer and PM",
    dates: "Aug 2025 to May 2026",
    summary:
      "Supplier risk portal for AI powered third party risk management. Shipped catalog, orders, work, and messaging with searchable color coded risk scores while scoping features with the partner team.",
    bullets: [
      "Built the portal UI and client data flows from purchase orders, payment history, and compliance posture.",
      "Designed Okta backed two factor auth and company scoped registration across frontend and backend.",
      "Scoped milestones with stakeholders and shipped Product Catalog, Orders, Work, and Messaging through final demo.",
    ],
    tags: ["frontend", "PM", "TPRM"],
    stage: "olive",
    slides: slides("exiger-supplier-portal", [
      { file: "slide-01.webp", caption: "Settings, my account" },
      { file: "slide-02.webp", caption: "Manage documents" },
      { file: "slide-03.webp", caption: "Product catalog, part detail and risk" },
      { file: "slide-04.webp", caption: "Orders and risk detail" },
      { file: "slide-05.webp", caption: "Work overview" },
      { file: "slide-06.webp", caption: "Messaging entry" },
      { file: "slide-07.webp", caption: "Product catalog list" },
      { file: "slide-08.webp", caption: "Catalog search and hierarchy" },
      { file: "slide-09.webp", caption: "Manage supplier overview" },
      { file: "slide-10.webp", caption: "Work overview tasks" },
      { file: "slide-11.webp", caption: "Questionnaire workflow" },
      { file: "slide-12.webp", caption: "Task filters" },
      { file: "slide-13.webp", caption: "Risk analysis" },
      { file: "slide-14.webp", caption: "Task detail and questionnaire" },
      { file: "slide-15.webp", caption: "Work board" },
      { file: "slide-16.webp", caption: "In app messaging" },
      { file: "slide-17.webp", caption: "Orders list" },
      { file: "slide-18.webp", caption: "Dashboard activity" },
      { file: "slide-19.webp", caption: "Tasks board with filters" },
      { file: "slide-20.webp", caption: "Catalog filtered product view" },
      { file: "slide-21.webp", caption: "Settings workspace members" },
      { file: "slide-22.webp", caption: "Settings account and members nav" },
    ]),
  },
  {
    slug: "adc-club-platform",
    name: "App Dev Club Platform",
    org: "UMD App Dev Club",
    role: "Fullstack contributor",
    dates: "Ongoing club platform",
    summary:
      "Internal club systems for People Portal recruitment and team ops, Tech Ops documentation, and partner repository explore. One carousel across the surfaces members use day to day.",
    bullets: [
      "Contributed fullstack features used by 700+ members for recruitment, onboarding, and team operations.",
      "Shipped ATS style role posting, Kanban review, and GitHub or Slack hooks for onboarding access.",
      "Documented team hierarchy and developer contribution flows, and surfaced partner org repositories in a shared explore view.",
    ],
    tags: ["fullstack", "ops", "docs"],
    stage: "slate",
    slides: [
      ...slides("adc-people-portal", [
        { file: "slide-01.webp", caption: "People Portal team detail" },
        { file: "slide-02.webp", caption: "People Portal teams list" },
        { file: "slide-03.webp", caption: "People Portal events and RSVP" },
        { file: "slide-04.webp", caption: "People Portal IAM sign in" },
        { file: "slide-05.webp", caption: "People Portal meetings calendar" },
        { file: "slide-06.webp", caption: "People Portal team settings" },
      ]),
      ...slides("adc-wiki", [
        { file: "slide-01.webp", caption: "Tech Ops wiki, understanding teams" },
        { file: "slide-02.webp", caption: "Tech Ops wiki, subteams structure" },
        { file: "slide-03.webp", caption: "Tech Ops wiki, team creation guide" },
        { file: "slide-04.webp", caption: "Tech Ops wiki, People Portal intro" },
      ]),
      ...slides("adc-git-explore", [
        { file: "slide-01.webp", caption: "Internal git explore across partner orgs" },
      ]),
    ],
  },
];

export function getPastWork(slug: string) {
  return pastWorkProjects.find((p) => p.slug === slug);
}
