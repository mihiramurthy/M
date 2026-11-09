export type ProjectTag = "fullstack" | "backend" | "ml" | "frontend";

export type CaseSection = {
  id: string;
  label: string;
  eyebrow?: string;
  title: string;
  body: string[];
  insight?: { title: string; points: { lead: string; text: string }[] };
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  short: string;
  tags: ProjectTag[];
  featured: boolean;
  stage: "cocoa" | "olive" | "slate" | "pine" | "inkblue" | "graphite";
  role: string;
  type: string;
  tools: string[];
  problem: string;
  approach: string;
  architecture: string[];
  tech: string[];
  highlights: string[];
  sections: CaseSection[];
  repoPath: string;
  demoPath: string;
  port: number;
  run: string[];
};

export const projects: Project[] = [
  {
    slug: "token-lens",
    name: "TokenLens",
    tagline: "AI spend intelligence with evidence-based routing",
    short:
      "Proxy OpenAI/Anthropic-style calls, attribute cost to teams, score output quality / hallucination risk, and downgrade models only when the evidence says you can.",
    tags: ["fullstack", "backend"],
    featured: true,
    stage: "graphite",
    role: "Fullstack / systems engineer",
    type: "Personal project",
    tools: ["Node.js", "Express", "proxy logging", "heuristics", "Next.js"],
    problem:
      "LLM spend grows silently across teams. Blind cheaper-model routing tanks quality; teams need cost attribution paired with output-quality evidence.",
    approach:
      "TokenLens sits as a thin proxy in front of chat APIs. Every request is logged, classified by prompt complexity, scored for quality/hallucination risk, attributed to a team, and evaluated for waste — so routing recommendations are evidence-based.",
    architecture: [
      "OpenAI- and Anthropic-compatible proxy endpoints",
      "Prompt complexity classifier (trivial → reasoning)",
      "Output-quality / hallucination scorer with factor lists",
      "Team cost attribution + waste → cheaper-model recommender",
      "Polylane-inspired observability dashboard",
    ],
    tech: ["Node.js", "Express", "JavaScript", "mock + optional live providers"],
    highlights: [
      "Works offline with mock providers; optional OPENAI_API_KEY / ANTHROPIC_API_KEY",
      "Downgrade only when complexity + quality headroom agree",
      "Unit-tested classifier, quality scorer, and routing rules",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Make every token accountable.",
        body: [
          "TokenLens is an AI spend control plane: a proxy that logs chat completions, tags them to teams, and surfaces where flagship models are wasted on trivial prompts.",
          "The twist is evidence — cheaper routing is gated by output-quality and hallucination-risk scores, not a flat “always use mini” policy.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Cost without quality is a trap.",
        body: [
          "Teams either over-provision (gpt-4o for “hi”) or under-provision (budget models on multi-step proofs) because dashboards show dollars without decision quality.",
          "A usable system needs complexity classification and post-hoc quality signals in the same loop as billing.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Attribute first:",
              text: "Without team IDs, spend conversations stay political.",
            },
            {
              lead: "Quality gates routing:",
              text: "Downgrade only when hall-risk is low and complexity is simple.",
            },
            {
              lead: "Mockable architecture:",
              text: "Recruiters can run the full loop without API keys.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "Proxy → classify → score → recommend.",
        body: [
          "Requests hit `/v1/chat/completions` or `/v1/messages`. TokenLens classifies the prompt, calls mock or live providers, scores the output, estimates cost, and attaches a keep/downgrade recommendation with savings.",
          "The dashboard shows spend by team, complexity mix, quality vs hall-risk pulse, routing opportunities, and a live playground.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Runnable today.",
        body: [
          "Standalone app under `projects/token-lens` with seed traffic, tests, and a Polylane-inspired UI (sparse light canvas, lime accents — original implementation, not a brand clone).",
        ],
      },
    ],
    repoPath: "projects/token-lens",
    demoPath: "/demos/token-lens",
    port: 4600,
    run: [
      "cd projects/token-lens",
      "npm install && npm run seed && npm run dev",
      "# http://localhost:4600",
    ],
  },
  {
    slug: "care-atlas",
    name: "CareAtlas",
    tagline: "Find care you can actually afford",
    short:
      "Matching underinsured patients to sliding-scale clinics with explainable scores and visit-prep checklists.",
    tags: ["fullstack"],
    featured: false,
    stage: "pine",
    role: "Fullstack engineer",
    type: "Personal project",
    tools: ["Node.js", "Express", "JavaScript", "Next.js", "Tailwind"],
    problem:
      "Finding a clinic that takes sliding-scale payments, speaks your language, and treats the right specialty still means calling ten numbers and hoping.",
    approach:
      "CareAtlas ranks clinics with an explainable scoring engine and generates a visit-prep checklist so the appointment is not wasted.",
    architecture: [
      "Express API over clinic inventory",
      "Deterministic match engine with auditable reasons",
      "Prep checklist keyed to eligibility",
      "Interactive demo embedded on this site",
    ],
    tech: ["Node.js", "Express", "JavaScript", "HTML/CSS"],
    highlights: [
      "Explainable ranking — every score point is readable",
      "Contrast endpoint for sliding-scale vs boutique",
      "Unit-tested match edge cases",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Taking the guesswork out of affordable care.",
        body: [
          "Directory apps list providers. Few model affordability, language, and specialty together — or tell you what documents charity-care intake needs.",
          "CareAtlas turns a short eligibility profile into a ranked shortlist with reasons you can audit, then a visit-prep checklist so the first appointment is usable.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Access is a systems problem.",
        body: [
          "Interviews and desk research around FQHC / sliding-scale intake showed the same failure modes: patients optimize for proximity, then discover cash prices or language gaps too late.",
          "Explainability mattered as much as accuracy — people needed to trust why a clinic ranked higher.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Affordability is invisible:",
              text: "Most finders bury sliding-scale status behind phone trees.",
            },
            {
              lead: "Language is a hard filter:",
              text: "A “nearby” clinic that cannot interpret is not nearby.",
            },
            {
              lead: "Prep prevents no-shows:",
              text: "Charity-care visits fail when documents are missing.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "An explainable matcher, not a black box.",
        body: [
          "Distance, sliding scale, Medicaid, language overlap, specialty fit, wait, and transit each contribute named points. Recruiters (and patients) can read the trail.",
          "The prep generator adapts to uninsured / Medicaid / specialty so intake is not a surprise.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Runnable API + live demo.",
        body: [
          "Standalone Express app with seed data and tests, plus an embedded interactive demo on this site for recruiters who will not spin up five servers.",
        ],
      },
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
    tagline: "Trace a claim before you amplify it",
    short:
      "Queueable provenance workers — archive, domain, agreement, urgency — with an explainable trust band.",
    tags: ["backend"],
    featured: false,
    stage: "inkblue",
    role: "Backend engineer",
    type: "Personal project",
    tools: ["Node.js", "Express", "async workers", "nanoid"],
    problem:
      "Misinformation outruns verification. Consumers get polarity badges without provenance.",
    approach:
      "Ingest URL/claim → parallel workers → trust band + event log. External APIs mocked so architecture runs offline.",
    architecture: [
      "Job queue with parallel workers",
      "Archive / domain / agreement / urgency modules",
      "Trust scorer with factor list",
      "Observability: events + metrics",
    ],
    tech: ["Node.js", "Express", "async workers"],
    highlights: [
      "202 Accepted job flow",
      "Preset viral vs established scenarios",
      "Caution-band and high-confidence tests",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Provenance before polarity.",
        body: [
          "Binary true/false badges collapse uncertainty. ClaimTrail shows the trail: archive thinness, domain youth, cross-source contradiction, linguistic pressure.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Virality has fingerprints.",
        body: [
          "Young domains, sparse archives, and absolutist framing co-occur with low-trust amplification. Established wires with epistemic markers behave differently.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Queues beat one-shots:",
              text: "Newsrooms need workers they can observe and retry.",
            },
            {
              lead: "Factors > scores alone:",
              text: "People calibrate trust when they see why.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "A miniature verification pipeline.",
        body: [
          "Four workers run in parallel; a scorer maps fixtures into a band. Presets make recruiter demos instant.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Offline-first architecture.",
        body: [
          "Deterministic mocks stand in for Wayback/WHOIS/fact-check APIs so the design stays honest and runnable anywhere.",
        ],
      },
    ],
    repoPath: "projects/claim-trail",
    demoPath: "/demos/claim-trail",
    port: 4200,
    run: ["cd projects/claim-trail", "npm install && npm run dev", "# http://localhost:4200"],
  },
  {
    slug: "aquifer-net",
    name: "AquiferNet",
    tagline: "Groundwater risk you can inspect",
    short:
      "Train a contamination risk model, ship offline metrics, explore what-if inference across monitoring sites.",
    tags: ["ml"],
    featured: false,
    stage: "slate",
    role: "ML engineer",
    type: "Personal project",
    tools: ["Python", "scikit-learn", "NumPy", "Node.js"],
    problem:
      "Private wells rarely get municipal-grade transparency. Communities need interpretable risk signals.",
    approach:
      "Physically motivated synthetic data → class-weighted logistic regression → portable JSON model + JS inference with driver contributions.",
    architecture: [
      "Python training → model.json + metrics.json",
      "Portable logistic inference in JS",
      "Site explorer with top drivers",
      "Offline eval report",
    ],
    tech: ["Python", "scikit-learn", "NumPy", "Node.js"],
    highlights: [
      "ROC-AUC ~0.77 on held-out data",
      "Contribution breakdown per prediction",
      "CPU-only — no cloud GPU required",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Make aquifer risk legible.",
        body: [
          "AquiferNet connects nitrate, chemistry, land-use proximity, and well depth into a probability you can poke — with the model coefficients and eval metrics in the open.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Opacity is the product failure.",
        body: [
          "Vendor scores without drivers do not help a county planner decide where to sample next. Contribution lists change the conversation.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Export the model:",
              text: "Portable JSON lets the web demo mirror Python training.",
            },
            {
              lead: "Brier + AUC together:",
              text: "Calibration matters for risk communication.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "Train → evaluate → explore.",
        body: [
          "A single training script writes artifacts the Node/Next inference layers consume. Sites load into a what-if predictor instantly.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Reproducible offline ML.",
        body: [
          "Model and metrics are committed so recruiters can run inference without retraining — and can retrain locally when they want.",
        ],
      },
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
    tagline: "Run loads when the grid is clean",
    short:
      "48-hour carbon intensity explorer with a demand-response planner that places flexible loads into clean windows.",
    tags: ["frontend"],
    featured: false,
    stage: "olive",
    role: "Frontend engineer",
    type: "Personal project",
    tools: ["JavaScript", "Canvas", "Express", "simulation"],
    problem:
      "Electrification without timing literacy can increase emissions.",
    approach:
      "Simulate regional intensity, visualize it, schedule EV/appliances into lowest contiguous windows vs evening-naive baseline.",
    architecture: [
      "Regional intensity simulation",
      "Contiguous-window planner",
      "Canvas chart with overlays",
      "Express forecast + plan API",
    ],
    tech: ["JavaScript", "Canvas", "Express"],
    highlights: [
      "Three regional signatures",
      "Measurable kg CO₂e savings",
      "Frontend substance with real math",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Timing is a climate feature.",
        body: [
          "Wattline makes grid carbon tangible: see the curve, then auto-place flexible loads where intensity dips.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Convenience schedules hide cost.",
        body: [
          "Evening peaks coincide with dirtier marginal generation in many regions. Shifting a few kWh is concrete and teachable.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Contiguous windows matter:",
              text: "EV charging is not a single timestep optimization.",
            },
            {
              lead: "Compare to naive:",
              text: "Savings vs 6pm start make the win obvious.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "Simulate → visualize → plan.",
        body: [
          "Regional knobs drive a 48h series; the planner searches lowest-average windows for each load duration.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Canvas-first interaction.",
        body: [
          "Standalone app and embedded demo share the same planning engine for consistent results.",
        ],
      },
    ],
    repoPath: "projects/wattline",
    demoPath: "/demos/wattline",
    port: 4400,
    run: ["cd projects/wattline", "npm install && npm run dev", "# http://localhost:4400"],
  },
  {
    slug: "loan-lattice",
    name: "LoanLattice",
    tagline: "See the forbearance trap before you pause",
    short:
      "Side-by-side Standard vs IDR vs forbearance-then-standard — cash, months, and capitalization made visible.",
    tags: ["fullstack"],
    featured: false,
    stage: "cocoa",
    role: "Fullstack engineer",
    type: "Personal project",
    tools: ["Node.js", "Express", "financial modeling"],
    problem:
      "Servicer portals rarely surface clear counterfactuals. Forbearance can quietly balloon balances.",
    approach:
      "Run Standard 10-year, PAYE-like IDR, and forbearance capitalization side by side with insight deltas.",
    architecture: [
      "Amortization + IDR engines",
      "Forbearance capitalization model",
      "Scenario compare API",
      "Strategy lab UI",
    ],
    tech: ["Node.js", "Express", "financial modeling"],
    highlights: [
      "Auditable math in finance.js",
      "Explicit capitalization warning",
      "Penalty invariant tests",
    ],
    sections: [
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Overview",
        title: "Repayment is a decision under fog.",
        body: [
          "LoanLattice clears the fog with three honest scenarios and the dollar penalty of pausing.",
        ],
      },
      {
        id: "research",
        label: "Research & Insights",
        eyebrow: "Research & Insights",
        title: "Pause now, pay later — literally.",
        body: [
          "Interest during forbearance capitalizes. That jump is the story most UIs bury under legalese.",
        ],
        insight: {
          title: "Key insights",
          points: [
            {
              lead: "Show the jump:",
              text: "Balance-after-capitalization is the teaching moment.",
            },
            {
              lead: "IDR is cashflow, not magic:",
              text: "Low payments can mean negative amortization until forgiveness.",
            },
          ],
        },
      },
      {
        id: "solution",
        label: "The Solution",
        eyebrow: "The Solution",
        title: "Three paths, one comparison.",
        body: [
          "Inputs for principal, rate, AGI, family size, and pause length drive Standard, IDR, and forbearance-trap outputs together.",
        ],
      },
      {
        id: "execution",
        label: "Execution",
        eyebrow: "Execution",
        title: "Math you can unit test.",
        body: [
          "Pure functions for amortization and IDR keep the demo honest and recruiter-auditable.",
        ],
      },
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

export const featuredProjects = projects.filter((p) => p.featured);
export const extraProjects = projects.filter((p) => !p.featured);
