import type { ReactNode } from "react";
import { SuppressionRulesLayout } from "@/views/suppression-rules";

export default function Layout({ children }: { children: ReactNode }) {
  return <SuppressionRulesLayout>{children}</SuppressionRulesLayout>;
}
