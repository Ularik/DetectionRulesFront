import type { CorrelationSeverity } from "../model/types";

export const CORRELATION_SEVERITIES: CorrelationSeverity[] = ["info", "low", "medium", "high", "critical"];

// Подписи и бейджи критичности — по макету «Правила корреляции» (public/images/correlation-rules.jpeg)
export const CORRELATION_SEVERITY_LABELS: Record<CorrelationSeverity, string> = {
  info: "Информационная",
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
};

export const CORRELATION_SEVERITY_STYLES: Record<CorrelationSeverity, string> = {
  info: "bg-sky-100 text-sky-700",
  low: "bg-[#fff3c4] text-[#8a6d00]",
  medium: "bg-[#ffe3c2] text-[#b45309]",
  high: "bg-[#fde2e2] text-[#c81e1e]",
  critical: "bg-[#b50000] text-white",
};

export const CORRELATION_SEVERITY_DOT: Record<CorrelationSeverity, string> = {
  info: "bg-sky-500",
  low: "bg-[#e0b400]",
  medium: "bg-[#f08a24]",
  high: "bg-[#e02424]",
  critical: "bg-[#8a0404]",
};
