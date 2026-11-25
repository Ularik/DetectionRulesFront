"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { routes } from "@/shared/config";
import certKgLogo from "./cert-kg.svg";
import {
  administrationMenu,
  dashboardMenuItems,
  isMenuItemActive,
  type DashboardMenuItem,
} from "../config/menu";

const MenuLink = ({
  item,
  pathname,
}: {
  item: DashboardMenuItem;
  pathname: string;
}) => {
  const Icon = item.icon;
  const isActive = isMenuItemActive(item, pathname);

  const link = (
    <Link
      href={item.href}
      aria-current={isActive && !item.children ? "page" : undefined}
      className={clsx(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-base text-white transition-colors",
        isActive ? "bg-brand-light" : "hover:bg-white/10",
      )}
    >
      <Icon className="size-6 shrink-0" strokeWidth={2} />
      <span className="flex-1">{item.label}</span>
      {item.children && (
        <ChevronDown
          aria-hidden
          className={clsx("size-4 shrink-0 transition-transform", !isActive && "-rotate-90")}
        />
      )}
    </Link>
  );

  if (!item.children || !isActive) return link;

  return (
    <div className="flex flex-col gap-1">
      {link}
      {item.children.map((child) => {
        const isChildActive =
          pathname === child.href || pathname.startsWith(`${child.href}/`);
        return (
          <Link
            key={child.href}
            href={child.href}
            aria-current={isChildActive ? "page" : undefined}
            className={clsx(
              "ml-9 rounded-lg px-3 py-1.5 text-sm transition-colors",
              isChildActive ? "bg-white/15 font-medium text-white" : "text-[#ccdae7] hover:bg-white/10",
            )}
          >
            {child.label}
          </Link>
        );
      })}
    </div>
  );
};

const AdministrationMenu = ({ pathname }: { pathname: string }) => {
  const { label, icon: Icon, items } = administrationMenu;
  const isGroupActive = items.some((item) => isMenuItemActive(item, pathname));
  // При заходе прямо в раздел группы она раскрыта; дальше — по клику
  const [isOpen, setIsOpen] = useState(isGroupActive);

  return (
    <nav className="mt-auto flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="sidebar-administration"
        onClick={() => setIsOpen((open) => !open)}
        className={clsx(
          "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left text-base text-white transition-colors",
          isGroupActive && !isOpen ? "bg-brand-light" : "hover:bg-white/10",
        )}
      >
        <Icon className="size-6 shrink-0" strokeWidth={2} />
        <span className="flex-1">{label}</span>
        <ChevronDown
          aria-hidden
          className={clsx("size-4 shrink-0 transition-transform", !isOpen && "-rotate-90")}
        />
      </button>

      {isOpen && (
        <div id="sidebar-administration" className="flex flex-col gap-2">
          {items.map((item) => (
            <MenuLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </nav>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-hidden border-r border-[#0a4f8c] bg-brand bg-[url(/videos/sidebar-poster.png)] bg-cover bg-center lg:block">
      {/* Живой фон по макету. Статичный кадр (фон aside) виден до загрузки видео и при prefers-reduced-motion. */}
      <video
        src="/videos/siem_wave_no_sidebar.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-cover motion-reduce:hidden"
      />

      <div className="scrollbar-subtle relative flex h-full flex-col gap-4 overflow-x-hidden overflow-y-auto px-5 pt-5 pb-6 [--scrollbar-thumb:rgb(255_255_255/0.25)]">
        <Link href={routes.home} className="flex items-center">
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
          {dashboardMenuItems.map((item) => (
            <MenuLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
  
        <AdministrationMenu pathname={pathname} />
      </div>
    </aside>
  );
};
