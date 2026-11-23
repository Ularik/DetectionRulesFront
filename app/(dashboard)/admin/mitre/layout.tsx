import type { ReactNode } from "react";
import { MitreLayout } from "@/views/mitre";

export default function Layout({ children }: { children: ReactNode }) {
  return <MitreLayout>{children}</MitreLayout>;
}
