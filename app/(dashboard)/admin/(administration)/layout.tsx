import type { ReactNode } from "react";
import { SectionTabs } from "@/widgets/section-tabs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <SectionTabs section="administration" />
      {children}
    </div>
  );
}
