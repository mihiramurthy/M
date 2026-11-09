import { DemoShell } from "@/components/DemoShell";
import { AquiferDemo } from "@/components/demos/AquiferDemo";

export const metadata = { title: "AquiferNet demo" };

export default function Page() {
  return (
    <DemoShell slug="aquifer-net">
      <AquiferDemo />
    </DemoShell>
  );
}
