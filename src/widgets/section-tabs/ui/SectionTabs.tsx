"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { sectionTabs, type Section } from "../config/tabs";

export function SectionTabs({ section }: { section: Section }) {
  const pathname = usePathname();
  const { label, tabs } = sectionTabs[section];

  return (
    <nav
      aria-label={label}
      className="mb-[18px] flex gap-1 overflow-x-auto border-b border-line"
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-light text-brand-light"
                : "border-transparent text-ink-muted hover:border-line hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
