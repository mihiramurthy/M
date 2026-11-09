import { spawn } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(
  __dirname,
  "..",
  "ocaml",
  "_build",
  "default",
  "bin",
  "main.exe"
);

export function engineAvailable() {
  return existsSync(bin);
}

export function checkProof(proofText) {
  return new Promise((resolve, reject) => {
    if (!existsSync(bin)) {
      reject(
        new Error(
          "OCaml engine binary missing. Run: npm run build:ocaml (needs ocaml + dune)"
        )
      );
      return;
    }
    const child = spawn(bin, [], { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", () => {
      try {
        const json = JSON.parse(stdout.trim().split("\n").filter(Boolean).pop());
        resolve(json);
      } catch (err) {
        reject(
          new Error(
            `Failed to parse engine output: ${err.message}\nstdout=${stdout}\nstderr=${stderr}`
          )
        );
      }
    });
    child.stdin.write(proofText);
    child.stdin.end();
  });
}
