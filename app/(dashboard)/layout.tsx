"use client";

import Sidebar from "@/components/sidebar/SideBar";
import { type ReactNode } from "react";
import ProtectedLayout from "@/middleware/ProtectedLayout";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {

  return (
    <ProtectedLayout roles={["ADMIN", "ANALYST", "VIEWER"]}>
      <div className="min-h-screen bg-[#F7F8F4]">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default DashboardLayout;
