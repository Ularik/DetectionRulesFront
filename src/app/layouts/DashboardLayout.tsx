"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/widgets/sidebar";
import { TopBar } from "./TopBar";
import { RoleGuard } from "@/app/guards";

type Props = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: Props) => {
  return (
    <RoleGuard roles={["ADMIN", "ANALYST", "VIEWER"]}>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-[18px] p-5">
          <TopBar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
};
