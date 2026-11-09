/**
 * Optional light informal → formal sketch.
 * Heuristic by default; uses OPENAI_API_KEY only if set (never as verifier).
 */

export async function informalToFormal(text) {
  const raw = String(text || "").trim();
  if (!raw) return { formal: "", notes: ["empty input"], provider: "none" };

  if (process.env.OPENAI_API_KEY) {
    try {
      const formal = await llmSketch(raw);
      return {
        formal,
        notes: ["LLM used only to draft formal steps — OCaml still verifies."],
        provider: "openai",
      };
    } catch (err) {
      return {
        formal: heuristicSketch(raw),
        notes: [`LLM unavailable (${err.message}); used heuristic sketch.`],
        provider: "heuristic-fallback",
      };
    }
  }
  return {
    formal: heuristicSketch(raw),
    notes: ["Heuristic sketch only — always run /api/check with the OCaml engine."],
    provider: "heuristic",
  };
}

function heuristicSketch(text) {
  const lower = text.toLowerCase();
  // Common CMSC250 patterns
  if (/modus ponens|from .* and .* conclude/i.test(text) || /\bgiven\b.*\bimplies\b/i.test(lower)) {
    return [
      "goal: Q",
      "P1: P  [Premise]",
      "P2: P -> Q  [Premise]",
      "S3: Q  [MP P1 P2]",
      "",
      "# Edit atoms to match your exercise.",
    ].join("\n");
  }
  if (/and|conjunction|both/i.test(lower)) {
    return [
      "goal: P /\\ Q",
      "A: P  [Premise]",
      "B: Q  [Premise]",
      "C: P /\\ Q  [AndIntro A B]",
    ].join("\n");
  }
  if (/contradiction|not both/i.test(lower)) {
    return [
      "goal: bot",
      "A: P  [Premise]",
      "B: ~P  [Premise]",
      "C: bot  [Contra A B]",
    ].join("\n");
  }
  return [
    "# Could not confidently sketch — start from premises:",
    "goal: R",
    "P1: P  [Premise]",
    "P2: Q  [Premise]",
    "# ... add inferences with [MP ...], [AndIntro ...], etc.",
  ].join("\n");
}

async function llmSketch(text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Convert informal propositional proof sketches into this DSL only:\nGOAL line optional: goal: FORMULA\nSteps: ID: FORMULA  [Rule Cite...]\nRules: Premise, Assumption, MP, MT, AndIntro, AndElimL, AndElimR, OrIntroL, OrIntroR, ImpIntro (with {discharge ID}), NegIntro, Contra, Dne, Reit, BotElim.\nUse ASCII /\\ \\/ -> ~ for connectives. No commentary.",
        },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}
