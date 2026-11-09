import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(__dirname, "..", "c", "dcf");

function run(args, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const child = spawn(BIN, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("dcf timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      clearTimeout(t);
      const line = out.trim().split("\n").filter(Boolean).pop() || err.trim();
      try {
        resolve({ code, json: JSON.parse(line) });
      } catch {
        reject(new Error(err || out || `dcf exit ${code}`));
      }
    });
  });
}

export async function listExamples() {
  const { json } = await run(["list"]);
  return json;
}

export async function runExample({
  example = "bank_race",
  seed = 16,
  steps = 32,
  explore = false,
  shrink = true,
} = {}) {
  const args = ["run", "--example", example, "--seed", String(seed), "--steps", String(steps)];
  if (explore) args.push("--explore");
  if (shrink) args.push("--shrink");
  const { code, json } = await run(args);
  return { ...json, exitCode: code, engine: "c-dcf" };
}

export async function replayExample({ example = "bank_race", seed = 16, schedule }) {
  const args = [
    "replay",
    "--example",
    example,
    "--seed",
    String(seed),
    "--schedule",
    Array.isArray(schedule) ? schedule.join(",") : String(schedule),
  ];
  const { code, json } = await run(args);
  return { ...json, exitCode: code, engine: "c-dcf" };
}

export async function benchExample({
  example = "bank_race",
  trials = 200,
  steps = 32,
  seed = 1,
} = {}) {
  const { json } = await run(
    ["bench", "--example", example, "--trials", String(trials), "--steps", String(steps), "--seed", String(seed)],
    60000
  );
  return { ...json, engine: "c-dcf" };
}
