import { clearRequests } from "./store.js";
import { handleChatProxy } from "./proxy.js";

const samples = [
  {
    team: "platform",
    model: "gpt-4o",
    messages: [{ role: "user", content: "What is the capital of France?" }],
  },
  {
    team: "platform",
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: "hi",
      },
    ],
  },
  {
    team: "growth",
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: "Write a friendly 2-sentence onboarding email for a new SaaS trial user.",
      },
    ],
  },
  {
    team: "research",
    model: "claude-3-5-sonnet",
    messages: [
      {
        role: "user",
        content:
          "Prove step-by-step that if n is even then n^2 is even. List constraints: use formal structure.",
      },
    ],
  },
  {
    team: "support",
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: "Summarize our refund policy in one sentence based on the provided context: refunds within 14 days.",
      },
    ],
  },
  {
    team: "research",
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: "Cite a fake citation arxiv paper about overnight productivity miracles.",
      },
    ],
  },
  {
    team: "growth",
    model: "claude-3-5-soniku",
    messages: [
      {
        role: "user",
        content: "What is the current price of AAPL today?",
      },
    ],
  },
  {
    team: "platform",
    model: "claude-3-5-sonnet",
    messages: [
      {
        role: "user",
        content:
          "Compare and contrast three architectures for an LLM proxy with observability. Include trade-offs and acceptance criteria.",
      },
    ],
  },
];

clearRequests();

const fakeReq = (sample) => ({
  header: (name) => (name === "x-team-id" ? sample.team : undefined),
  body: {
    model: sample.model,
    messages: sample.messages,
  },
});

for (const sample of samples) {
  // fix typo model name path
  if (sample.model === "claude-3-5-soniku") sample.model = "claude-3-5-haiku";
  await handleChatProxy(fakeReq(sample));
}

console.log(`Seeded ${samples.length} TokenLens requests`);
