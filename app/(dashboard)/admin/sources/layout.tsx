import type { ReactNode } from "react";
import { SourcesLayout } from "@/views/sources";

export default function Layout({ children }: { children: ReactNode }) {
  return <SourcesLayout>{children}</SourcesLayout>;
}
