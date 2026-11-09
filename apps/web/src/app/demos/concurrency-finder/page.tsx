import { DemoShell } from "@/components/DemoShell";
import { ConcurrencyFinderDemo } from "@/components/demos/ConcurrencyFinderDemo";

export const metadata = { title: "Concurrency Finder demo" };

export default function Page() {
  return (
    <DemoShell slug="concurrency-finder">
      <ConcurrencyFinderDemo />
    </DemoShell>
  );
}
