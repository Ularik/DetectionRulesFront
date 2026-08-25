import { LayoutDashboard, LucideIcon, Plane, Tags } from "lucide-react";

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
    href: "/admin",
    icon: LayoutDashboard,
  },

];
