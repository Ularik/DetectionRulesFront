import type { ReactNode } from "react";
import { HuntersTabs } from "@/widgets/hunters-tabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HuntersTabs />
      {children}
    </div>
  );
}
