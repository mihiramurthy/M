export type ProjectTag = "fullstack" | "backend" | "ml" | "frontend";

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  tags: ProjectTag[];
  problem: string;
  approach: string;
  architecture: string[];
  tech: string[];
  highlights: string[];
  repoPath: string;
  demoPath: string;
  port: number;
  run: string[];
};

export const projects: Project[] = [
  {
    slug: "care-atlas",
    name: "CareAtlas",
    tagline: "Access-to-care navigator for underinsured patients",
    tags: ["fullstack"],
    problem:
      "Finding a clinic that takes sliding-scale payments, speaks your language, and treats the right specialty still means calling ten numbers and hoping. Directory apps list providers; few model affordability, language, and specialty together — or tell you what documents charity-care intake actually needs.",
    approach:
      "CareAtlas ranks clinics with an explainable scoring engine (distance, sliding scale, Medicaid, language overlap, specialty fit, wait, transit) and generates a visit-prep checklist so the appointment is not wasted. Seeded inventory around College Park / PG County demonstrates the product loop end-to-end.",
    architecture: [
      "Express API over JSON clinic inventory",
      "Deterministic match engine with auditable reason strings",
      "Prep checklist generator keyed to eligibility profile",
      "Static demo UI for recruiter-friendly local runs",
    ],
    tech: ["Node.js", "Express", "JavaScript", "HTML/CSS"],
    highlights: [
      "Explainable ranking — every point of score is human-readable",
      "Contrast endpoint for sliding-scale vs boutique outcomes",
      "Unit-tested match edge cases (radius, uninsured preference)",
    ],
    repoPath: "projects/care-atlas",
    demoPath: "/demos/care-atlas",
    port: 4100,
    run: [
      "cd projects/care-atlas",
      "npm install && npm run seed && npm run dev",
      "# http://localhost:4100",
    ],
  },
  {
    slug: "claim-trail",
    name: "ClaimTrail",
    tagline: "Provenance pipeline for claims before they go viral",
    tags: ["backend"],
    problem:
      "Misinformation outruns verification. Consumers get polarity badges without provenance; newsrooms need queueable, observable pipelines — not one-shot classifiers glued to a single API.",
    approach:
      "ClaimTrail ingests a URL and/or claim text, enqueues specialized workers (archive history, domain age, cross-source agreement, linguistic urgency), and emits an explainable trust band with a full event log and simple metrics. External services are mocked with deterministic fixtures so the architecture runs offline.",
    architecture: [
      "Job queue abstraction with parallel workers",
      "Archive / domain / agreement / urgency worker modules",
      "Trust scorer with factor list + caution bands",
      "Observability hooks: event stream + enqueue/complete/fail metrics",
    ],
    tech: ["Node.js", "Express", "async workers", "nanoid"],
    highlights: [
      "202 Accepted job flow with polling",
      "Preset scenarios for viral vs established sources",
      "Tests covering caution-band and high-confidence paths",
    ],
    repoPath: "projects/claim-trail",
    demoPath: "/demos/claim-trail",
    port: 4200,
    run: ["cd projects/claim-trail", "npm install && npm run dev", "# http://localhost:4200"],
  },
  {
    slug: "aquifer-net",
    name: "AquiferNet",
    tagline: "Groundwater contamination risk — train, evaluate, explore",
    tags: ["ml"],
    problem:
      "Private wells and rural aquifers rarely get the transparency of municipal dashboards. Communities need interpretable risk signals tied to nitrate, chemistry, land use, and well construction — not opaque vendor scores.",
    approach:
      "AquiferNet synthesizes physically motivated training data, fits a class-weighted logistic regression with StandardScaler, exports portable model JSON, and ships offline metrics (accuracy, ROC-AUC, Brier). A Node inference layer mirrors the Python pipeline for what-if exploration across seeded Maryland monitoring sites.",
    architecture: [
      "Python training script → model.json + metrics.json",
      "Portable logistic inference in JavaScript",
      "Site explorer with top feature drivers",
      "Offline evaluation report for recruiter audit",
    ],
    tech: ["Python", "scikit-learn", "NumPy", "Node.js", "Express"],
    highlights: [
      "Train/eval split with ROC-AUC ~0.77 on held-out data",
      "Contribution breakdown per prediction",
      "Runnable without cloud GPUs — CPU sklearn only",
    ],
    repoPath: "projects/aquifer-net",
    demoPath: "/demos/aquifer-net",
    port: 4300,
    run: [
      "cd projects/aquifer-net",
      "pip install -r requirements.txt && npm install",
      "npm run train && npm run dev",
      "# http://localhost:4300",
    ],
  },
  {
    slug: "wattline",
    name: "Wattline",
    tagline: "Grid carbon intensity explorer + demand-response planner",
    tags: ["frontend"],
    problem:
      "Electrification without timing literacy can increase emissions. Households still run EV chargers and appliances on convenience schedules while regional intensity swings with solar, wind, and evening peaks.",
    approach:
      "Wattline simulates a 48-hour intensity curve from regional mix knobs, renders an interactive canvas chart, and places flexible loads into the lowest contiguous carbon windows — reporting kilograms CO₂e saved versus an evening-naive baseline.",
    architecture: [
      "Regional intensity simulation engine",
      "Contiguous-window load planner",
      "Canvas visualization with placement overlays",
      "Express API for forecast + plan",
    ],
    tech: ["JavaScript", "Canvas", "Express", "simulation"],
    highlights: [
      "Three regions with distinct renewable signatures",
      "Measurable kg CO₂e savings vs naive schedule",
      "Frontend-substance demo with real scheduling math",
    ],
    repoPath: "projects/wattline",
    demoPath: "/demos/wattline",
    port: 4400,
    run: ["cd projects/wattline", "npm install && npm run dev", "# http://localhost:4400"],
  },
  {
    slug: "loan-lattice",
    name: "LoanLattice",
    tagline: "Student loan strategy lab with forbearance-trap modeling",
    tags: ["fullstack"],
    problem:
      "Federal repayment choice is cashflow, interest capitalization, and forgiveness timelines — yet servicer portals rarely surface clear counterfactuals. Forbearance can quietly balloon balances.",
    approach:
      "LoanLattice runs Standard 10-year, PAYE-like IDR (10% discretionary), and a forbearance-then-standard path side by side, surfacing total paid, months, forgiven amount, and the capitalization penalty of pausing.",
    architecture: [
      "Amortization + IDR engines in pure JS",
      "Forbearance capitalization model",
      "Scenario compare API + insight deltas",
      "Interactive strategy lab UI",
    ],
    tech: ["Node.js", "Express", "financial modeling", "HTML/CSS"],
    highlights: [
      "Auditable math in server/finance.js",
      "Explicit forbearance capitalization warning",
      "Unit tests for payoff and penalty invariants",
    ],
    repoPath: "projects/loan-lattice",
    demoPath: "/demos/loan-lattice",
    port: 4500,
    run: ["cd projects/loan-lattice", "npm install && npm run dev", "# http://localhost:4500"],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
