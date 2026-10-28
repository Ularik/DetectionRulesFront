import type { ANALYST_STATUS } from "../model/types";

export const INCIDENT_STATUS_LABELS: Record<ANALYST_STATUS, string> = {
  new: "Новый",
  in_review: "На проверке",
  confirmed: "Подтвержден",
  false_positive: "Ложное срабатывание",
  closed: "Закрыт",
};

export const ANALYST_STATUSES = [
  "new",
  "in_review",
  "confirmed",
  "false_positive",
  "closed",
] as const satisfies readonly ANALYST_STATUS[];

export function isAnalystStatus(value: string): value is ANALYST_STATUS {
  return ANALYST_STATUSES.some((status) => status === value);
}

export const INCIDENT_SEVERITY_STYLES: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-sky-200 bg-sky-50 text-sky-700",
};

// Цвет точки и текста критичности (макет CERT-KG SIEM)
export const INCIDENT_SEVERITY_COLORS: Record<string, { dot: string; text: string }> = {
  critical: { dot: "bg-[#b50000]", text: "text-[#8a0404]" },
  high: { dot: "bg-[#ff8024]", text: "text-[#c25400]" },
  medium: { dot: "bg-[#0965c5]", text: "text-[#0965c5]" },
  low: { dot: "bg-[#0ac053]", text: "text-[#078a3b]" },
};
