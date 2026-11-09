import { nanoid } from "nanoid";
import { classifyComplexity, extractPromptText } from "./classify.js";
import { scoreOutputQuality } from "./quality.js";
import { estimateCost, normalizeModel } from "./pricing.js";
import { recommendRouting } from "./recommend.js";
import { realOrMockComplete } from "./mockProvider.js";
import { addRequest } from "./store.js";

export async function handleChatProxy(req) {
  const started = Date.now();
  const body = req.body || {};
  const teamId =
    req.header("x-team-id") ||
    body.team_id ||
    body.metadata?.team_id ||
    "unassigned";

  const model = normalizeModel(body.model || "gpt-4o-mini");
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const system =
    body.system ||
    messages.find((m) => m.role === "system")?.content ||
    "";
  const userMessages = messages.filter((m) => m.role !== "system");

  const promptText = extractPromptText(userMessages, system);
  const complexity = classifyComplexity(promptText);

  const completion = await realOrMockComplete({
    model,
    messages: userMessages,
    system: typeof system === "string" ? system : "",
  });

  const quality = scoreOutputQuality({
    prompt: promptText,
    output: completion.content,
    model: completion.model || model,
  });

  const costUsd = estimateCost(
    completion.model || model,
    completion.usage.prompt_tokens,
    completion.usage.completion_tokens
  );

  const record = {
    id: nanoid(12),
    ts: new Date().toISOString(),
    latencyMs: Date.now() - started,
    teamId,
    model: completion.model || model,
    provider: completion.provider,
    promptPreview: promptText.slice(0, 220),
    outputPreview: completion.content.slice(0, 280),
    usage: completion.usage,
    costUsd,
    complexity,
    quality,
    warning: completion.warning || null,
  };
  record.recommendation = recommendRouting(record);
  addRequest(record);

  return {
    record,
    response: {
      id: completion.id,
      object: "chat.completion",
      model: record.model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: completion.content },
          finish_reason: "stop",
        },
      ],
      usage: completion.usage,
      tokenlens: {
        request_id: record.id,
        team_id: teamId,
        complexity: complexity.level,
        quality_score: quality.qualityScore,
        hallucination_risk: quality.hallucinationRisk,
        cost_usd: costUsd,
        recommendation: record.recommendation,
      },
    },
  };
}

export async function handleAnthropicProxy(req) {
  const body = req.body || {};
  // Normalize Anthropic-style body into chat handler
  const messages = Array.isArray(body.messages) ? body.messages : [];
  req.body = {
    model: body.model || "claude-3-5-haiku",
    system: body.system,
    messages,
    team_id: body.team_id,
  };
  const { record, response } = await handleChatProxy(req);
  return {
    record,
    response: {
      id: response.id,
      type: "message",
      role: "assistant",
      model: response.model,
      content: [{ type: "text", text: response.choices[0].message.content }],
      usage: {
        input_tokens: response.usage.prompt_tokens,
        output_tokens: response.usage.completion_tokens,
      },
      tokenlens: response.tokenlens,
    },
  };
}
