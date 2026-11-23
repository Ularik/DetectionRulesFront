import {
  Bell,
  Crosshair,
  Database,
  House,
  Layers,
  type LucideIcon,
  Radar,
  Settings,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { routes } from "@/shared/config";

export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  // Префиксы путей, на которых пункт подсвечивается (по умолчанию — только href)
  match?: string[];
  // Подсвечивать только при точном совпадении (для «Главной», чей href — префикс всех разделов)
  exact?: boolean;
};

// Порядок и названия — по макету CERT-KG SIEM (Figma)
export const dashboardMenuItems: DashboardMenuItem[] = [
  {
    label: "Главная",
    href: routes.home,
    icon: House,
    exact: true,
  },
  {
    label: "Организации",
    href: routes.organizations,
    icon: Bell,
  },
  {
    label: "Raw data",
    href: routes.events,
    icon: Database,
  },
  {
    label: "Инциденты",
    href: routes.incidents,
    icon: ShieldAlert,
  },
  {
    label: "Сценарии",
    href: routes.scenarios,
    icon: Workflow,
  },
  {
    label: "Threat Intelligence",
    href: routes.ioc,
    icon: Radar,
  },
  {
    label: "MITRE ATT&CK",
    href: routes.mitre,
    icon: Crosshair,
  },
  {
    label: "Источники",
    href: routes.sources,
    icon: Layers,
  },
];

// Пункт закреплён внизу сайдбара
export const administrationMenuItem: DashboardMenuItem = {
  label: "Администрирование",
  href: routes.rules,
  icon: Settings,
  match: [
    routes.rules,
    routes.correlationRules,
    routes.suppressionRules,
    routes.audit,
  ],
};

export const isMenuItemActive = (item: DashboardMenuItem, pathname: string) =>
  item.exact
    ? pathname === item.href
    : (item.match ?? [item.href]).some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
