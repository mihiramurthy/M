import { DemoShell } from "@/components/DemoShell";
import { WattlineDemo } from "@/components/demos/WattlineDemo";

export const metadata = { title: "Wattline demo" };

export default function Page() {
  return (
    <DemoShell slug="wattline">
      <WattlineDemo />
    </DemoShell>
  );
}
