import type { Severity } from "../model/types";

export const SCENARIO_SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

// «Критичность: высокая» в факторах оценки сценария
export const SCENARIO_SEVERITY_LABELS: Record<Severity, string> = {
  low: "низкая",
  medium: "средняя",
  high: "высокая",
  critical: "критическая",
};

// Пояснения системного статуса (макет CERT-KG SIEM, Frame 126)
export const SCENARIO_STATUS_LABELS: Record<string, string> = {
  open: "open (события продолжают поступать)",
  stale: "stale (новых событий нет)",
  closed: "closed (сценарий закрыт)",
};
