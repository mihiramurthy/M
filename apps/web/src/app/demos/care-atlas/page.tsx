import { DemoShell } from "@/components/DemoShell";
import { CareAtlasDemo } from "@/components/demos/CareAtlasDemo";

export const metadata = { title: "CareAtlas demo" };

export default function Page() {
  return (
    <DemoShell slug="care-atlas">
      <CareAtlasDemo />
    </DemoShell>
  );
}
