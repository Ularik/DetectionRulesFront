import type { ReactNode } from "react";
import { IocLayout } from "@/views/ioc";

export default function Layout({ children }: { children: ReactNode }) {
  return <IocLayout>{children}</IocLayout>;
}
