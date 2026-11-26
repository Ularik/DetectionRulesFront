import { routes } from "@/shared/config";
import { normalizeEngineResourceType } from "@/entities/audit";

/** Ссылка на карточку объекта аудита; null — у типа нет своей страницы */
export function getResourceHref(resourceType: string, resourceId: string | null): string | null {
  if (!resourceId) return null;
  switch (normalizeEngineResourceType(resourceType)) {
    case "correlation_rule":
      return routes.correlationRule(resourceId);
    case "rule":
      return routes.rule(resourceId);
    case "suppression_rule":
      return routes.suppressionRule(resourceId);
    case "ioc":
      return routes.iocEntry(resourceId);
    case "organization":
      return routes.organization(resourceId);
    case "source":
      return routes.source(resourceId);
    case "normalization_profile":
      return routes.normalizationProfile(resourceId);
    case "incident":
      return routes.incident(resourceId);
    case "scenario":
      return routes.scenario(resourceId);
    case "asset":
      return routes.assets;
    case "mitre":
      return routes.mitreTechnique(resourceId);
    default:
      return null;
  }
}

/** У правил есть вкладка «История» — туда ведёт кнопка в панели деталей */
export function getResourceHistoryHref(resourceType: string, resourceId: string | null): string | null {
  if (!resourceId) return null;
  switch (normalizeEngineResourceType(resourceType)) {
    case "correlation_rule":
      return routes.correlationRuleHistory(resourceId);
    case "rule":
      return routes.ruleHistory(resourceId);
    default:
      return null;
  }
}
