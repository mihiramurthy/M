import { DemoShell } from "@/components/DemoShell";
import { ProofDebuggerDemo } from "@/components/demos/ProofDebuggerDemo";

export const metadata = { title: "Proof Debugger demo" };

export default function Page() {
  return (
    <DemoShell slug="proof-debugger">
      <ProofDebuggerDemo />
    </DemoShell>
  );
}
