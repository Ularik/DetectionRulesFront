"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const hunterTabs = [
  { label: "Инциденты", href: "/admin/hunters/incidents" },
  { label: "Сценарии", href: "/admin/hunters/scenarios" },
  { label: "События", href: "/admin/hunters/events" },
];

export default function HuntersLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        aria-label="Разделы охотников"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200"
      >
        {hunterTabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-[#1E2B6D] text-[#1E2B6D]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
