import {
  Bell,
  Crosshair,
  Database,
  GitMerge,
  House,
  Layers,
  LocateFixed,
  type LucideIcon,
  Shuffle,
  Radar,
  Settings,
  Filter,
  ScrollText,
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
  // Подпункты — раскрываются под пунктом, когда раздел активен
  children?: { label: string; href: string }[];
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

// Группа «Администрирование» закреплена внизу сайдбара и раскрывается по клику
export const administrationMenu = {
  label: "Администрирование",
  icon: Settings,
  items: [
    {
      label: "Правила обнаружения",
      href: routes.rules,
      icon: LocateFixed,
    },
    {
      label: "Правила корреляции",
      href: routes.correlationRules,
      icon: GitMerge,
    },
    {
      label: "Правила подавления",
      href: routes.suppressionRules,
      icon: Filter,
    },
    {
      label: "Нормализация",
      href: routes.normalizationProfiles,
      icon: Shuffle,
      match: [routes.normalizationProfiles, routes.normalizationFields],
      children: [
        { label: "Профили нормализации", href: routes.normalizationProfiles },
        { label: "Поля нормализации", href: routes.normalizationFields },
      ],
    },
    {
      label: "Аудит",
      href: routes.audit,
      icon: ScrollText,
    },
  ] satisfies DashboardMenuItem[],
};

export const isMenuItemActive = (item: DashboardMenuItem, pathname: string) =>
  item.exact
    ? pathname === item.href
    : (item.match ?? [item.href]).some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
