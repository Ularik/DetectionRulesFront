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


export const isDev = process.env.NODE_ENV === "development";

// На продакшене (в Docker) запросы будут идти на тот же домен, где открыт сайт, в папку /api/
// В режиме разработки (локально) будет использоваться localhost:8000 (или 8001)
export const apiURL = isDev
  ? "http://localhost:8001/api"
  : typeof window === "undefined"
    ? "http://backend:8000/api" // имя сервиса из docker-compose + внутренний порт
    : "/api";

export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: "Правила обнаружения",
    href: "/admin/rules",
    icon: LayoutDashboard,
  },
  {
    label: "Аудит",
    href: "/admin/audit",
    icon: Plane,
  },
  {
    label: "Правила корелляции",
    href: "/admin/crule",
    icon: Star,
  },
  {
    label: "Существующие вред скрипты payload",
    href: "/admin/ioc",
    icon: Tags,
  },
  {
    label: "Супер правила",
    href: "/admin/supers",
    icon: CircleUser,
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

export const actionAction = [
  {
    value: "block",
    label: "Block",
  },
  {
    value: "investigate",
    label: "Investigate",
  },
  {
    value: "monitor",
    label: "Monitor",
  },
  {
    value: "ignore",
    label: "Ignore",
  },
];

export const actionSeverity = [
  {
    value: "critical",
    label: "Critical",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "low",
    label: "Low",
  },
  {
    value: "info",
    label: "Info",
  },
];

export const actionDecision = [
  {
    value: "malicious",
    label: "Malicious",
  },
  {
    value: "suspicious",
    label: "Suspicious",
  },
  {
    value: "benign",
    label: "Benign",
  },
];

export const tableClassName = "w-full table-fixed text-sm";

export const headerRowClassName =
  "bg-gray-50 text-gray-600 uppercase text-xs tracking-wider overflow-hidden";

export const rowClassName =
  "hover:bg-blue-50/40 transition-colors border-b border-gray-100 first:rounded-t-2xl last:rounded-b-2xl";
