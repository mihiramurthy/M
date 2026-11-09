import { clearAll, addSubmission } from "./store.js";
import { checkProof } from "./engine.js";

const samples = [
  {
    studentId: "alice",
    exercise: "hw3-mp",
    proof: `goal: Q\nP1: P  [Premise]\nP2: P -> Q  [Premise]\nS3: Q  [MP P1 P2]`,
  },
  {
    studentId: "bob",
    exercise: "hw3-mp",
    proof: `goal: P\nP1: P  [Premise]\nP2: P -> Q  [Premise]\nS3: P  [MP P1 P2]`,
  },
  {
    studentId: "cara",
    exercise: "hw3-mp",
    proof: `goal: R\nP1: P  [Premise]\nP2: P -> Q  [Premise]\nS3: R  [MP P1 P2]`,
  },
  {
    studentId: "dan",
    exercise: "hw4-and",
    proof: `goal: P\nA: P /\\ Q  [Premise]\nB: Q  [AndElimL A]`,
  },
  {
    studentId: "erin",
    exercise: "hw4-and",
    proof: `goal: P\nA: P /\\ Q  [Premise]\nB: P  [AndElimL A]`,
  },
  {
    studentId: "fin",
    exercise: "hw3-mp",
    proof: `goal: Q\nP1: P  [Premise]\nP2: P -> Q  [Premise]\nS3: Q  [MP P1 P2]`,
  },
];

clearAll();
for (const s of samples) {
  const result = await checkProof(s.proof);
  addSubmission({
    studentId: s.studentId,
    exercise: s.exercise,
    proofText: s.proof,
    result,
  });
}
console.log(`Seeded ${samples.length} submissions`);
