import type { ReactNode } from "react";
import { RulesLayout } from "@/views/rules";

export default function Layout({ children }: { children: ReactNode }) {
  return <RulesLayout>{children}</RulesLayout>;
}
