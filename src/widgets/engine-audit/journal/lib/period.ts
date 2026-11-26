export type PeriodPreset = "today" | "7d" | "30d" | "all" | "custom";

export interface Period {
  preset: PeriodPreset;
  /** yyyy-mm-dd, включительно */
  from: string;
  to: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function presetPeriod(preset: Exclude<PeriodPreset, "custom">): Period {
  const today = new Date();
  if (preset === "all") return { preset, from: "", to: "" };
  const from = new Date(today);
  if (preset === "7d") from.setDate(today.getDate() - 6);
  if (preset === "30d") from.setDate(today.getDate() - 29);
  return { preset, from: toDateInput(from), to: toDateInput(today) };
}

export const PERIOD_PRESETS: { value: Exclude<PeriodPreset, "custom">; label: string }[] = [
  { value: "today", label: "Сегодня" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "all", label: "Всё время" },
];

const formatDay = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

export function periodLabel(period: Period) {
  if (!period.from && !period.to) return "Всё время";
  return `${period.from ? formatDay(period.from) : "…"} – ${period.to ? formatDay(period.to) : "…"}`;
}

/** Попадает ли момент времени в период (границы — локальные сутки) */
export function inPeriod(timestamp: string, period: Period) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return true;
  if (period.from && time < new Date(`${period.from}T00:00:00`).getTime()) return false;
  if (period.to && time > new Date(`${period.to}T23:59:59.999`).getTime()) return false;
  return true;
}
