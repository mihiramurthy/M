/** Lightweight JS mirror of the OCaml ND kernel for the portfolio live demo.
 * Authoritative verifier remains the OCaml binary in projects/proof-debugger.
 */

export type Formula =
  | { t: "atom"; name: string }
  | { t: "not"; f: Formula }
  | { t: "and" | "or" | "imp"; l: Formula; r: Formula }
  | { t: "bot" }
  | { t: "top" };

export type Step = {
  id: string;
  formula: Formula;
  rule: string;
  cites: string[];
  discharge?: string;
  raw: string;
};

function eq(a: Formula, b: Formula): boolean {
  if (a.t !== b.t) return false;
  if (a.t === "atom" && b.t === "atom") return a.name === b.name;
  if (a.t === "bot" || a.t === "top") return true;
  if (a.t === "not" && b.t === "not") return eq(a.f, b.f);
  if (
    (a.t === "and" || a.t === "or" || a.t === "imp") &&
    a.t === b.t
  ) {
    return eq(a.l, b.l) && eq(a.r, b.r);
  }
  return false;
}

export function show(f: Formula): string {
  if (f.t === "atom") return f.name;
  if (f.t === "bot") return "⊥";
  if (f.t === "top") return "⊤";
  if (f.t === "not") return `¬${atomish(f.f)}`;
  if (f.t === "and") return `${atomish(f.l)} ∧ ${atomish(f.r)}`;
  if (f.t === "or") return `${atomish(f.l)} ∨ ${atomish(f.r)}`;
  return `${atomish(f.l)} → ${atomish(f.r)}`;
}
function atomish(f: Formula) {
  return f.t === "atom" || f.t === "bot" || f.t === "top" || f.t === "not"
    ? show(f)
    : `(${show(f)})`;
}

export function parseFormula(input: string): Formula {
  const s = input.trim();
  let i = 0;
  const peek = () => s[i];
  const bump = () => i++;
  const skip = () => {
    while (peek() === " " || peek() === "\t") bump();
  };
  const starts = (p: string) => s.slice(i, i + p.length) === p;
  const eat = (p: string) => {
    if (starts(p)) {
      i += p.length;
      return true;
    }
    return false;
  };

  function parseImp(): Formula {
    skip();
    let left = parseOr();
    skip();
    if (eat("->") || eat("→")) {
      skip();
      return { t: "imp", l: left, r: parseImp() };
    }
    return left;
  }
  function parseOr(): Formula {
    skip();
    let left = parseAnd();
    for (;;) {
      skip();
      if (eat("\\/") || eat("∨")) {
        skip();
        left = { t: "or", l: left, r: parseAnd() };
      } else break;
    }
    return left;
  }
  function parseAnd(): Formula {
    skip();
    let left = parseUnary();
    for (;;) {
      skip();
      if (eat("/\\") || eat("∧") || eat("^")) {
        skip();
        left = { t: "and", l: left, r: parseUnary() };
      } else break;
    }
    return left;
  }
  function parseUnary(): Formula {
    skip();
    if (eat("~") || eat("¬") || eat("not ")) return { t: "not", f: parseUnary() };
    return parseAtom();
  }
  function parseAtom(): Formula {
    skip();
    if (eat("(")) {
      const f = parseImp();
      skip();
      if (!eat(")")) throw new Error("expected )");
      return f;
    }
    if (eat("false") || eat("bot") || eat("⊥")) return { t: "bot" };
    if (eat("true") || eat("top") || eat("⊤")) return { t: "top" };
    const m = /^[A-Za-z][A-Za-z0-9_]*/.exec(s.slice(i));
    if (!m) throw new Error(`bad formula near ${s.slice(i, i + 12)}`);
    i += m[0].length;
    return { t: "atom", name: m[0] };
  }
  const f = parseImp();
  skip();
  if (i !== s.length) throw new Error(`trailing: ${s.slice(i)}`);
  return f;
}

export function parseProof(text: string) {
  const steps: Step[] = [];
  let goal: Formula | undefined;
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (/^goal:/i.test(t)) {
      goal = parseFormula(t.slice(5));
      continue;
    }
    const m = /^([^:]+):\s*(.+?)\s*\[([^\]]+)\](?:\s*\{discharge\s+([^}]+)\})?$/i.exec(t);
    if (!m) throw new Error(`parse step: ${t}`);
    const citesTok = m[3].trim().split(/\s+/);
    steps.push({
      id: m[1].trim(),
      formula: parseFormula(m[2]),
      rule: citesTok[0],
      cites: citesTok.slice(1),
      discharge: m[4]?.trim(),
      raw: t,
    });
  }
  return { goal, steps };
}

function normRule(r: string) {
  const n = r.toLowerCase();
  if (["mp", "impelim", "->e", "→e"].includes(n)) return "mp";
  if (["premise", "prem", "given"].includes(n)) return "premise";
  if (["andintro", "andi", "/\\i", "∧i"].includes(n)) return "andintro";
  if (["andeliml", "andel", "/\\e1", "∧e1"].includes(n)) return "andeliml";
  if (["andelimr", "ander", "/\\e2", "∧e2"].includes(n)) return "andelimr";
  if (["assumption", "assume", "hyp"].includes(n)) return "assumption";
  if (["mt"].includes(n)) return "mt";
  if (["contra", "contradiction"].includes(n)) return "contra";
  if (["reit", "r"].includes(n)) return "reit";
  return n;
}

export function checkProof(text: string) {
  const proof = parseProof(text);
  const proved = new Map<string, Formula>();
  let i = 0;
  for (const step of proof.steps) {
    try {
      apply(step, proved);
      proved.set(step.id, step.formula);
      i++;
    } catch (err) {
      return {
        ok: false as const,
        engine: "js-mirror",
        pattern: pattern(normRule(step.rule)),
        stepsBeforeError: i,
        error: {
          stepId: step.id,
          rule: step.rule,
          formula: show(step.formula),
          message: String((err as Error).message || err),
          hint: hint(normRule(step.rule)),
        },
        steps: proof.steps.map((s) => ({
          id: s.id,
          formula: show(s.formula),
          rule: s.rule,
          cites: s.cites,
        })),
      };
    }
  }
  const goalReached = proof.goal
    ? proof.steps.length > 0 &&
      eq(proof.steps[proof.steps.length - 1].formula, proof.goal)
    : true;
  return {
    ok: true as const,
    engine: "js-mirror",
    stepsChecked: i,
    goalReached,
    steps: proof.steps.map((s) => ({
      id: s.id,
      formula: show(s.formula),
      rule: s.rule,
      cites: s.cites,
    })),
  };
}

function apply(step: Step, proved: Map<string, Formula>) {
  const need = (id: string) => {
    const f = proved.get(id);
    if (!f) throw new Error(`unknown citation '${id}'`);
    return f;
  };
  const rule = normRule(step.rule);
  const expected = step.formula;
  if (rule === "premise" || rule === "assumption") {
    if (step.cites.length) throw new Error("Premise/Assumption take no citations");
    return;
  }
  if (rule === "mp") {
    if (step.cites.length !== 2) throw new Error("MP needs two citations");
    const [a, b] = step.cites.map(need);
    const ok =
      (a.t === "imp" && eq(a.l, b) && eq(a.r, expected)) ||
      (b.t === "imp" && eq(b.l, a) && eq(b.r, expected));
    if (!ok)
      throw new Error(
        `Modus ponens on ${show(a)} and ${show(b)} does not yield ${show(expected)}. Need P and (P→Q) to conclude Q.`
      );
    return;
  }
  if (rule === "andintro") {
    const [a, b] = step.cites.map(need);
    if (
      !(
        expected.t === "and" &&
        ((eq(expected.l, a) && eq(expected.r, b)) ||
          (eq(expected.l, b) && eq(expected.r, a)))
      )
    )
      throw new Error(`∧-Intro mismatch for ${show(expected)}`);
    return;
  }
  if (rule === "andeliml") {
    const a = need(step.cites[0]);
    if (!(a.t === "and" && eq(a.l, expected)))
      throw new Error(`∧-Elim-L on ${show(a)} does not yield ${show(expected)}`);
    return;
  }
  if (rule === "andelimr") {
    const a = need(step.cites[0]);
    if (!(a.t === "and" && eq(a.r, expected)))
      throw new Error(`∧-Elim-R on ${show(a)} does not yield ${show(expected)}`);
    return;
  }
  if (rule === "mt") {
    const [a, b] = step.cites.map(need);
    const ok =
      (a.t === "imp" && b.t === "not" && eq(a.r, b.f) && expected.t === "not" && eq(expected.f, a.l)) ||
      (b.t === "imp" && a.t === "not" && eq(b.r, a.f) && expected.t === "not" && eq(expected.f, b.l));
    if (!ok) throw new Error("Modus tollens needs (P→Q) and ¬Q to conclude ¬P");
    return;
  }
  if (rule === "contra") {
    const [a, b] = step.cites.map(need);
    const ok =
      expected.t === "bot" &&
      ((a.t === "not" && eq(a.f, b)) || (b.t === "not" && eq(b.f, a)));
    if (!ok) throw new Error("Contradiction needs φ and ¬φ to conclude ⊥");
    return;
  }
  if (rule === "reit") {
    const a = need(step.cites[0]);
    if (!eq(a, expected)) throw new Error(`Reiteration mismatch`);
    return;
  }
  throw new Error(`unsupported rule '${step.rule}' in JS mirror`);
}

function pattern(rule: string) {
  if (rule === "mp") return "modus_ponens_misapply";
  if (rule.startsWith("and")) return "and_elim_mismatch";
  if (rule === "mt") return "modus_tollens_misapply";
  return "rule_application";
}
function hint(rule: string) {
  if (rule === "mp") return "Cite both the implication P→Q and the antecedent P; conclude Q.";
  return "Verify the rule's required premises and conclusion shape.";
}

export const SAMPLES = {
  valid: `goal: Q
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: Q  [MP P1 P2]`,
  invalid: `goal: P
P1: P  [Premise]
P2: P -> Q  [Premise]
S3: P  [MP P1 P2]`,
};
