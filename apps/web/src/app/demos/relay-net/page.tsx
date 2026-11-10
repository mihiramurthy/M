import { DemoShell } from "@/components/DemoShell";
import { RelayNetDemo } from "@/components/demos/RelayNetDemo";

export const metadata = { title: "RelayNet demo" };

export default function Page() {
  return (
    <DemoShell slug="relay-net">
      <RelayNetDemo />
    </DemoShell>
  );
}
