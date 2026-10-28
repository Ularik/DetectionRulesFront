import { type ReactNode } from "react";
import { DashboardLayout } from "@/app/layouts";

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
