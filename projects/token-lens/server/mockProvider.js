import { normalizeModel } from "./pricing.js";

/** Deterministic mock completions — no API keys required. */
export async function mockComplete({ model, messages, system }) {
  const prompt = [...(system ? [{ role: "system", content: system }] : []), ...messages]
    .map((m) => (typeof m.content === "string" ? m.content : ""))
    .join("\n");

  await delay(40 + Math.min(120, prompt.length / 20));

  let content = "";
  if (/capital of france/i.test(prompt)) {
    content =
      "Based on the provided question: the capital of France is Paris.";
  } else if (/step[- ]by[- ]step|prove/i.test(prompt)) {
    content = [
      "Step 1: Restate the claim from the prompt.",
      "Step 2: Identify given assumptions.",
      "Step 3: Apply a valid inference rule.",
      "Therefore the conclusion follows from the premises.",
    ].join("\n");
  } else if (/fabricate|fake citation|arxiv/i.test(prompt)) {
    // intentionally shaky for quality scorer demos
    content =
      "According to a 2027 study (doi: 10.9999/fake-hallucination) productivity rose 482.7% overnight.";
  } else if (/latest|today|current price/i.test(prompt)) {
    content =
      "I do not have real-time access to live market data; I can outline how you would verify the latest figure from a primary source.";
  } else {
    content = `Mock ${normalizeModel(model)} response: ${summarize(prompt)}`;
  }

  const promptTokens = Math.max(8, Math.round(prompt.length / 4));
  const completionTokens = Math.max(12, Math.round(content.length / 4));

  return {
    id: `mock_${Date.now()}`,
    model: normalizeModel(model),
    provider: "mock",
    content,
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  };
}

function summarize(prompt) {
  const clean = prompt.replace(/\s+/g, " ").trim();
  return clean.slice(0, 180) + (clean.length > 180 ? "…" : "");
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function realOrMockComplete(opts) {
  const model = normalizeModel(opts.model);
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey && model.startsWith("gpt")) {
    try {
      return await callOpenAI(opts, openaiKey, model);
    } catch (err) {
      const fallback = await mockComplete(opts);
      fallback.provider = "mock-fallback";
      fallback.warning = String(err.message || err);
      return fallback;
    }
  }

  if (anthropicKey && model.startsWith("claude")) {
    try {
      return await callAnthropic(opts, anthropicKey, model);
    } catch (err) {
      const fallback = await mockComplete(opts);
      fallback.provider = "mock-fallback";
      fallback.warning = String(err.message || err);
      return fallback;
    }
  }

  return mockComplete({ ...opts, model });
}

async function callOpenAI(opts, key, model) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return {
    id: data.id,
    model,
    provider: "openai",
    content: data.choices?.[0]?.message?.content || "",
    usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  };
}

async function callAnthropic(opts, key, model) {
  const system = opts.system || "";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system: system || undefined,
      messages: opts.messages.filter((m) => m.role !== "system"),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  const content = (data.content || []).map((c) => c.text || "").join("\n");
  return {
    id: data.id,
    model,
    provider: "anthropic",
    content,
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens:
        (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}
