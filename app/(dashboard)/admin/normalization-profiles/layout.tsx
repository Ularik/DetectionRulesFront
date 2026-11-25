import type { ReactNode } from "react";
import { NormalizationProfilesLayout } from "@/views/normalization-profiles";

export default function Layout({ children }: { children: ReactNode }) {
  return <NormalizationProfilesLayout>{children}</NormalizationProfilesLayout>;
}
