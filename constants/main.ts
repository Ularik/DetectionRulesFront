import {
  FileUser,
  CircleUser,
  FolderOpen,
  LayoutDashboard,
  type LucideIcon,
  Newspaper,
  Plane,
  Star,
  Tags,
  Users,
} from "lucide-react";
import type { UserRole } from "@/types/users";

export type DashboardMenuItem = {
  label: string;
  href: string;
  roles: UserRole[];
  icon: LucideIcon;
};

export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: "Правила",
    href: "/admin",
    roles: ["ADMIN"],
    icon: LayoutDashboard,
  },
];

export const roleDashboardPaths: Record<UserRole, string> = {
  ADMIN: "/admin",
  ANALYST: "/analyst",
  VIEWER: "/viewer",
};

export const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition " +
  "focus-visible:border-[#1E2B6D] focus-visible:ring-2 focus-visible:ring-[#1E2B6D]/20";

export const theme = {
  bg: "#E9F0FA",
  border: "#CBD9EE",

  cyan: "#3FE6FF",
  cyanHover: "#2fd6ef",

  overlay: "rgba(0,0,0,0.4)",

  shadow: "rgba(0,0,0,0.06)",
  glow: "rgba(63,230,255,0.12)",

  dark: "#031633",
};

export const tableClassName = "w-full table-fixed text-sm";

export const headerRowClassName =
  "bg-gray-50 text-gray-600 uppercase text-xs tracking-wider overflow-hidden";

export const rowClassName =
  "hover:bg-blue-50/40 transition-colors border-b border-gray-100 first:rounded-t-2xl last:rounded-b-2xl";
