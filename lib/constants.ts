import { LayoutDashboard, LucideIcon, Plane, Tags } from "lucide-react";

export const apiURL = "http://127.0.0.1:8001/";


export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};


export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: "Панель",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Правила обнаружения",
    href: "/rules",
    icon: Plane,
  },
  {
    label: "Добавить правило",
    href: "/addRules",
    icon: Tags,
  }
];
