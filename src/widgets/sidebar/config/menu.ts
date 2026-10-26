import {
  Building2,
  CircleUser,
  Crosshair,
  BrainCircuit,
  LayoutDashboard,
  type LucideIcon,
  Plane,
  Star,
  Tags,
} from "lucide-react";
import { routes } from "@/shared/config";

export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: "Организации",
    href: routes.organizations,
    icon: Building2,
  },
  {
    label: "Правила обнаружения",
    href: routes.rules,
    icon: LayoutDashboard,
  },
  {
    label: "Инциденты",
    href: routes.incidents,
    icon: LayoutDashboard,
  },
  {
    label: "Аудит",
    href: routes.audit,
    icon: Plane,
  },
  {
    label: "Правила корелляции",
    href: routes.correlationRules,
    icon: Star,
  },
  {
    label: "Существующие вред скрипты payload",
    href: routes.ioc,
    icon: Tags,
  },
  {
    label: "Супер правила",
    href: routes.suppressionRules,
    icon: CircleUser,
  },
  {
    label: "Охотники",
    href: routes.hunters,
    icon: Crosshair,
  },
  {
    label: "MITRE ATT&CK",
    href: routes.mitre,
    icon: BrainCircuit,
  },
];
