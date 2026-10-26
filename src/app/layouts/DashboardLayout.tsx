"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/widgets/sidebar";
import { RoleGuard } from "@/app/guards";

type Props = {
  children: ReactNode;
};

export const DashboardLayout = ({ children }: Props) => {
  return (
    <RoleGuard roles={["ADMIN", "ANALYST", "VIEWER"]}>
      <div className="min-h-screen bg-[#F7F8F4]">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};
