import { DemoShell } from "@/components/DemoShell";
import { ClaimTrailDemo } from "@/components/demos/ClaimTrailDemo";

export const metadata = { title: "ClaimTrail demo" };

export default function Page() {
  return (
    <DemoShell slug="claim-trail">
      <ClaimTrailDemo />
    </DemoShell>
  );
}
