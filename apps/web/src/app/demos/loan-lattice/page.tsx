import { DemoShell } from "@/components/DemoShell";
import { LoanLatticeDemo } from "@/components/demos/LoanLatticeDemo";

export const metadata = { title: "LoanLattice demo" };

export default function Page() {
  return (
    <DemoShell slug="loan-lattice">
      <LoanLatticeDemo />
    </DemoShell>
  );
}
