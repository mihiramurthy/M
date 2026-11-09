import { DemoShell } from "@/components/DemoShell";
import { TokenLensDemo } from "@/components/demos/TokenLensDemo";

export const metadata = { title: "TokenLens demo" };

export default function Page() {
  return (
    <DemoShell slug="token-lens">
      <TokenLensDemo />
    </DemoShell>
  );
}
