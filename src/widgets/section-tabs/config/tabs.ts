import { routes } from "@/shared/config";

export type SectionTab = {
  label: string;
  href: string;
};

export type Section = "administration";

// Подразделы пунктов сайдбара, в которых несколько экранов
export const sectionTabs: Record<Section, { label: string; tabs: SectionTab[] }> =
  {
    administration: {
      label: "Администрирование",
      tabs: [
        { label: "Правила обнаружения", href: routes.rules },
        { label: "Правила корреляции", href: routes.correlationRules },
        { label: "Правила подавления", href: routes.suppressionRules },
        { label: "Аудит", href: routes.audit },
      ],
    },
  };
