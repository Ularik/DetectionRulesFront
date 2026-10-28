"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { routes } from "@/shared/config";
import certKgLogo from "./cert-kg.svg";
import { dashboardMenuItems } from "../config/menu";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-[#0a4f8c] bg-linear-to-b from-brand to-brand-light px-5 pt-5 pb-6 lg:flex">
      <Link href={routes.admin} className="flex items-center">
        <Image
          src={certKgLogo}
          alt="CERT-KG"
          width={118}
          height={132}
          priority
          className="h-[132px] w-[118px] shrink-0"
        />
        <div className="flex flex-col gap-0.5 whitespace-nowrap text-[#ccdae7]">
          <span className="text-lg font-bold">CERT-KG</span>
          <span className="text-base">SIEM</span>
        </div>
      </Link>

      <div className="h-px w-full shrink-0 bg-white/20" />

      <nav className="flex flex-col gap-2 py-4">
        {dashboardMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base text-white transition-colors",
                isActive ? "bg-brand-light" : "hover:bg-white/10",
              )}
            >
              <Icon className="size-6 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
