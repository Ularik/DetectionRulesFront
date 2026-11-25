import type { ReactNode } from "react";
import { OrganizationsLayout } from "@/views/organizations";

export default function Layout({ children }: { children: ReactNode }) {
  return <OrganizationsLayout>{children}</OrganizationsLayout>;
}
