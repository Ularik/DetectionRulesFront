import type { ReactNode } from "react";
import { CorrelationRulesLayout } from "@/views/correlation-rules";

export default function Layout({ children }: { children: ReactNode }) {
  return <CorrelationRulesLayout>{children}</CorrelationRulesLayout>;
}
